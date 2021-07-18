
import fastify from 'fastify';
import fastifyWebsocket from 'fastify-websocket';
import { WebSocketManager } from './services/WebSocketManager';

console.log('Initializing Fastify');

const server = fastify({ logger: true });
server.register(fastifyWebsocket, { options: { perMessageDeflate: true } });

const webSocketManager = new WebSocketManager();
server.get('/api/ws', { websocket: true }, webSocketManager.handler);

server.get('/api', async () => {
    return { hello: 'world2' };
});

server.ready(() => {
    console.log('Fastify ready');
});

const start = async () => {
    try {
        await server.listen(3001);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();