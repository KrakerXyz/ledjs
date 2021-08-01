
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import fastify from 'fastify';
import fastifyWebsocket from 'fastify-websocket';
import fastifyCookie from 'fastify-cookie';
import fastifyJWT from 'fastify-jwt';

import { WebSocketManager } from './services/WebSocketManager';
import { EnvKey, getRequiredConfig } from './services/config';
import { configureDb } from '@krakerxyz/typed-base';
import { apiRoutes } from './rest';
import { deviceAuthentication, jwtAuthentication, RequestServicesContainer } from './services';

console.log('Configuring db');
configureDb({
    dbName: 'netled',
    uri: getRequiredConfig(EnvKey.DbConnectionString)
});

console.log('Initializing Fastify');

const server = fastify({
    logger: true
});

const webSocketManager = new WebSocketManager();

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
    },
    options: {
        perMessageDeflate: true,
    }
});

server.get('/ws/device', { websocket: true, preValidation: [deviceAuthentication] }, webSocketManager.handler);
server.get('/ws/client', { websocket: true, preValidation: [jwtAuthentication] }, webSocketManager.handler);

apiRoutes.forEach(r => server.route(r));

server.get('/api', async () => {
    return { hello: 'world2' };
});

server.ready(() => {
    console.log('Fastify ready');
});

const start = async () => {
    try {
        await server.listen(3001, '0.0.0.0');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();