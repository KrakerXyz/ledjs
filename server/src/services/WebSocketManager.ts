import { FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';

export class WebSocketManager {

    private _connections: WsConnection[] = [];

    public handler = (socketStream: SocketStream, request: FastifyRequest) => {
        console.log('Incoming WS connection');

        let wsConnection: WsConnection | undefined;
        let did: string | undefined;
        if (did = (request.query as Record<string, string>)['device-id']) {
            wsConnection = {
                type: 'device',
                id: did,
                socketStream
            };
        } else {
            wsConnection = {
                type: 'user',
                id: 'anonymous',
                socketStream
            };
        }
        this._connections.push(wsConnection);

        socketStream.socket.on('close', () => {
            console.log('WS Disconnected');
            const index = this._connections.findIndex(x => x.socketStream === socketStream);
            this._connections.splice(index, 1);
        });

        socketStream.socket.on('message', (message: any) => {
            console.log('Received WS message' + message);
            const devices = this._connections.filter(x => x.type === 'device');
            if (!devices.length) { return; }
            console.log(`Relaying message to ${devices.length}`);
            devices.forEach(d => d.socketStream.socket.send(message));
        });

    }

}

interface WsConnection {
    type: 'device' | 'user';
    id: string;
    socketStream: SocketStream;
}