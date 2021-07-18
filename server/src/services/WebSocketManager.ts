import { FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';

export class WebSocketManager {

    public handler(socketStream: SocketStream, _request: FastifyRequest) {
        console.log('Incoming WS connection');

        socketStream.socket.on('close', () => console.log('WS Disconnected'));

        socketStream.socket.on('message', (message: any) => {
            console.log('Received WS message' + message);
            socketStream.socket.send('Message response');
        });

        setInterval(() => {
            console.log('Sent WS Ping');
            socketStream.socket.send('Ping');
        }, 10000);
    }

}