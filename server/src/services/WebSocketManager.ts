import { FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';
import { DeviceDb } from '../db/DeviceDb';

export class WebSocketManager {

    private _connections: WsConnection[] = [];

    public handler = async (socketStream: SocketStream, request: FastifyRequest) => {
        console.log('Incoming WS connection');

        let wsConnection: WsConnection | undefined;

        if (request.headers.authorization) {
            const authParts = request.headers.authorization.split(' ');
            if (authParts.length !== 2) {
                socketStream.destroy(new Error('Malformed authorization header'));
                return;
            } else if (authParts[0].toLowerCase() !== 'basic') {
                socketStream.destroy(new Error('Invalid scheme'));
                return;
            }

            const tokenValue = Buffer.from(authParts[1], 'base64').toString();
            const tokenParts = tokenValue.split(':');
            if (tokenParts.length !== 2) {
                socketStream.destroy(new Error('Malformed token value'));
                return;
            }

            const deviceDb = new DeviceDb();
            const device = await deviceDb.byId(tokenParts[0]);
            if (device?.secret !== tokenParts[1]) {
                socketStream.destroy(new Error('Invalid token'));
                return;
            }

            wsConnection = {
                type: 'device',
                id: device.id,
                socketStream
            };
        } else {

            try {
                await request.jwtVerify();
            } catch (e) {
                socketStream.destroy(e);
                return;
            }

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