import { FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';
import { ToDeviceMessage } from '../../../core/dist/cjs';

export class WebSocketManager {

    private _connections: Map<string, WsConnection> = new Map();

    public handler = async (socketStream: SocketStream, req: FastifyRequest) => {
        console.log('Incoming WS connection');

        socketStream.socket.on('close', () => {
            req.log.debug('WS Disconnected');
            this._connections.delete(req.user.sub);
        });

        socketStream.socket.on('message', (message: any) => {
            req.log.debug('Received WS message' + message);
        });

        const wsConnection: WsConnection = {
            type: req.url.endsWith('/device') ? 'device' : 'user',
            id: req.user.sub,
            socketStream
        };

        this._connections.set(req.user.sub, wsConnection);

    }

    public sendDeviceMessage(msg: ToDeviceMessage, ...deviceIds: string[]) {
        const msgJson = JSON.stringify(msg);
        for (const did of deviceIds) {
            const con = this._connections.get(did);
            if (!con) { continue; }
            con.socketStream.socket.send(msgJson);
        }
    }

}

interface WsConnection {
    type: 'device' | 'user';
    id: string;
    socketStream: SocketStream;
}