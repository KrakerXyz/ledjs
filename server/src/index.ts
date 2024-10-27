
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import fastifyStatic from '@fastify/static';

import { WebSocketManager, EnvKey, getRequiredConfig, deviceAuthentication, jwtAuthentication, RequestServicesContainer } from './services';
import Ajv from 'ajv';
import path from 'path';
import { apiRoutes } from './rest';

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
    }
});

const schemaCompilers: Record<string, Ajv> = {
    'body': new Ajv({
        removeAdditional: false,
        coerceTypes: false,
        allErrors: true,
        strictTuples: false // without this we get warning about the json schema generated from [string, ...string[]]
    }),
    'params': new Ajv({
        removeAdditional: false,
        coerceTypes: true,
        allErrors: true
    }),
    'querystring': new Ajv({
        removeAdditional: false,
        coerceTypes: true,
        allErrors: true,
    })
};

server.setValidatorCompiler(req => {
    if (!req.httpPart) {
        throw new Error('Missing httpPart');
    }
    const compiler = schemaCompilers[req.httpPart];
    if (!compiler) {
        throw new Error(`Missing compiler for ${req.httpPart}`);
    }

    return compiler.compile(req.schema);
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
        conn.socket.close(4001, 'Unauthorized');
        conn.destroy();
    }
});

server.register(async function (fastify) {
    //Since updating to the new fastify, this must be inside this server.register or we'll get ws connection failed errors on client
    fastify.get('/ws/device', { websocket: true, preValidation: [deviceAuthentication] }, webSocketManager.handler);
    fastify.get('/ws/client', { websocket: true, preValidation: [jwtAuthentication] }, webSocketManager.handler);
});

server.register(fastifyCookie);

const staticHeaders = {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
};

server.register(fastifyStatic, {
    root: path.join(__dirname, '.web'),
    immutable: true,
    maxAge: '1d',
    setHeaders: res => {
        res.headers(staticHeaders);
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
    await res.headers(staticHeaders).sendFile('index.html');
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