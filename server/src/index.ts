
import fastify from 'fastify';
import fastifyWebsocket from 'fastify-websocket';
import fastifyCookie from 'fastify-cookie';
import fastifyJWT from 'fastify-jwt';

import { WebSocketManager } from './services/WebSocketManager';
import { EnvKey, getRequiredConfig } from './services/config';
import { configureDb } from '@krakerxyz/typed-base';
import { apiRoutes } from './rest';
import { RequestUser } from './services';

console.log('Configuring db');
configureDb({
    dbName: 'netled',
    uri: getRequiredConfig(EnvKey.DbConnectionString)
});

console.log('Initializing Fastify');

const server = fastify({ logger: true });
server.register(fastifyJWT, {
    secret: getRequiredConfig(EnvKey.JwtSecret),
    cookie: {
        cookieName: 'jwt',
        signed: false
    },
    formatUser(token) {
        if (typeof token !== 'object') { throw new Error('Token was not an object'); }
        return new RequestUser((token as any).sub, (token as any).jti);
    }
});

server.register(fastifyCookie);

server.register(fastifyWebsocket, {
    options: { perMessageDeflate: true }
});

const webSocketManager = new WebSocketManager();
server.get('/ws', { websocket: true }, webSocketManager.handler);

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