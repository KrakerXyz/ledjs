
import fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import path from 'path';
import { getSchemaValidator } from './db/schema/schemaUtility.js';
import { WebSocketManager } from './services/ws/WebSocketManager.js';
import { RequestServicesContainer } from './services/RequestServicesContainer.js';
import fastifyStatic from '@fastify/static';
import { apiRoutes } from './rest/index.js';
import { getRequiredConfig, EnvKey } from './services/config.js';
import { deviceAuthentication } from './services/deviceAuthentication.js';
import { jwtAuthentication } from './services/jwtAuthentication.js';

import { fileURLToPath } from 'url';
import Ajv from 'ajv';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

console.log('Initializing Fastify');

const server = fastify({
    logger: {
        level: 'trace',
        transport: process.env.NODE_ENV === 'development' ? {
            target: 'pino-pretty',
            options: {
                translateTime: 'SYS:h:MM:ss TT Z o',
                colorize: true,
                ignore: 'pid,hostname'
            }
        } : undefined
    },
});

server.setValidatorCompiler(req => {
    if (!req.httpPart) {
        throw new Error('Missing httpPart');
    }
    const validator = getSchemaValidator(req.httpPart as any, req.schema);
    if (!validator) {
        throw new Error(`Missing validator for ${req.httpPart}`);
    }

    return validator;
});

const webSocketManager = new WebSocketManager(server.log.child({ name: 'ws.services.WebSocketManager' }));

server.decorateRequest('services', { getter: () => new RequestServicesContainer(webSocketManager) });

server.register(fastifyJWT, {
    secret: getRequiredConfig(EnvKey.JwtSecret),
    cookie: {
        cookieName: 'jwt',
        signed: false
    }
});

server.register(fastifyWebsocket, {
    errorHandler: (_, conn) => {
        conn.close(4001, 'Unauthorized');
    }
});

server.register(async function (fastify) {
    //Since updating to the new fastify, this must be inside this server.register or we'll get ws connection failed errors on client
    fastify.get('/ws/device', { websocket: true, preValidation: [deviceAuthentication] }, webSocketManager.handler as any);
    fastify.get('/ws/client', { websocket: true, preValidation: [jwtAuthentication] }, webSocketManager.handler as any);
});

server.register(fastifyCookie);

server.register(fastifyStatic, {
    root: path.join(__dirname, '.web'),
    immutable: true,
    maxAge: '1d',
    setHeaders: res => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    }
});

apiRoutes.forEach(r => server.route(r));


server.setNotFoundHandler({}, async (req, res) => {
    if (req.method !== 'GET') {
        await res.status(404).send();
        return;
    }
    if (req.url.startsWith('/api')) {
        await res.status(404).send();
        return;
    }
    await res.headers({
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
    }).sendFile('index.html');
});

server.ready(() => {
    server.log.info('Fastify ready');
});

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '::' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();