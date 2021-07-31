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

        if (wsConnection.type === 'device') { this.initializeDevice(wsConnection.id, req); }

        this._connections.set(req.user.sub, wsConnection);

    }

    public sendDeviceMessage(msg: ToDeviceMessage, ...deviceIds: [string, ...string[]]) {
        const msgJson = JSON.stringify(msg);
        for (const did of deviceIds) {
            const con = this._connections.get(did);
            if (!con) { continue; }
            con.socketStream.socket.send(msgJson);
        }
    }

    private async initializeDevice(deviceId: string, req: FastifyRequest) {
        const device = await req.services.deviceDb.byId(deviceId);
        if (!device) { return; }
        req.log.info('Sending %s initial deviceSetup', deviceId);
        this.sendDeviceMessage({
            type: 'deviceSetup',
            data: {
                numLeds: device.numLeds
            }
        }, deviceId);

        if (device.status.animation) {
            this.sendDeviceMessage({
                type: 'animationSetup',
                data: device.status.animation
            }, deviceId);
        }
    }

}

interface WsConnection {
    type: 'device' | 'user';
    id: string;
    socketStream: SocketStream;
}