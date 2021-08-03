import { FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';
import { Device, ToDeviceMessage } from 'netled';

export class WebSocketManager {

    private _connections: Map<string, WsConnection> = new Map();

    public handler = async (socketStream: SocketStream, req: FastifyRequest) => {
        console.log('Incoming WS connection');

        socketStream.socket.on('close', async () => {
            req.log.debug('WS Disconnected');

            const connection = this._connections.get(req.user.sub);
            console.assert(connection);
            if (!connection) { return; }

            this._connections.delete(req.user.sub);

            if (connection.type === 'device') {
                const device = await req.services.deviceDb.byId(connection.id);
                console.assert(device);
                if (!device) { return; }

                device.status.wentOffline = Date.now();
                await req.services.deviceDb.replace(device);
            }
        });

        socketStream.socket.on('message', (message: any) => {
            req.log.debug('Received WS message' + message);
        });

        const wsConnection: WsConnection = {
            type: req.url.endsWith('/device') ? 'device' : 'user',
            id: req.user.sub,
            socketStream
        };

        if (wsConnection.type === 'device') {

            const device = await req.services.deviceDb.byId(wsConnection.id);
            console.assert(device);
            if (!device) { return; }

            // Calling initialize synchronously definitely does not work. 
            // I tried with immediate and 0 timeout but it's still too quick.  Setting to 10ms
            // Seen sporadic failed with 10ms. Setting to 100ms
            setTimeout(() => {
                this.initializeDevice(device, req);
            }, 100);

            device.status.cameOnline = Date.now();
            device.status.lastContact = Date.now();
            device.status.wanIp = req.ip;

            await req.services.deviceDb.replace(device);

        }

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

    private initializeDevice(device: Device, req: FastifyRequest) {

        if (!device) { return; }

        req.log.info('Sending %s initial deviceSetup', device.id);
        this.sendDeviceMessage({
            type: 'deviceSetup',
            data: {
                ...device.setup
            }
        }, device.id);

        if (device.animation) {
            this.sendDeviceMessage({
                type: 'animationSetup',
                data: device.animation
            }, device.id);
        }

        if (device.isStopped) {
            this.sendDeviceMessage({
                type: 'animationStop',
                data: { stop: device.isStopped }
            }, device.id);
        }
    }

}

interface WsConnection {
    type: 'device' | 'user';
    id: string;
    socketStream: SocketStream;
}