
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import fastifyStatic from '@fastify/static';

import { WebSocketManager, EnvKey, getRequiredConfig, deviceAuthentication, jwtAuthentication, RequestServicesContainer } from './services';
import { configureDb } from '@krakerxyz/typed-base';
import { apiRoutes } from './rest';
import Ajv from 'ajv';
import path from 'path';

console.log('Configuring db');
configureDb({
    dbName: 'netled',
    uri: getRequiredConfig(EnvKey.DbConnectionString)
});

console.log('Initializing Fastify');

const server = fastify({
    logger: {
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
        allErrors: true
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

server.register(fastifyCookie);

server.register(fastifyWebsocket, {
    errorHandler: (_, conn) => {
        conn.socket.close(4001, 'Unauthorized');
        conn.destroy();
    }
});

server.register(fastifyStatic, {
    root: path.join(__dirname, '.web'),
    immutable: true,
    maxAge: '1d'
});

server.get('/ws/device', { websocket: true, preValidation: [deviceAuthentication] }, webSocketManager.handler);
server.get('/ws/client', { websocket: true, preValidation: [jwtAuthentication] }, webSocketManager.handler);

apiRoutes.forEach(r => server.route(r));

server.setNotFoundHandler({}, (req, res) => {
    if (req.method !== 'GET') { res.status(404).send(); }
    if (req.url.startsWith('/api')) { res.status(404).send(); }
    res.sendFile('index.html');
});

server.ready(() => {
    server.log.info('Fastify ready');
});

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '0.0.0.0' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();