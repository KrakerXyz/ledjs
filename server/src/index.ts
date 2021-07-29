
import fastify from 'fastify';
import fastifyWebsocket from 'fastify-websocket';
import { WebSocketManager } from './services/WebSocketManager';
import { EnvKey, getRequiredConfig } from './config';
import { configureDb } from '@krakerxyz/typed-base';
import * as rest from './rest';

console.log('Configuring db');
configureDb({
    dbName: 'netled',
    uri: getRequiredConfig(EnvKey.DbConnectionString)
});

console.log('Initializing Fastify');

const server = fastify({ logger: true });
server.register(fastifyWebsocket, { options: { perMessageDeflate: true } });

const webSocketManager = new WebSocketManager();
server.get('/ws', { websocket: true }, webSocketManager.handler);

server.get('/api/animations/:animationId/script', rest.animation.scriptById);
server.get('/api/animations/:animationId', rest.animation.getById);
server.get('/api/animations', rest.animation.get);
server.post('/api/animations', rest.animation.post);

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