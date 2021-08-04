import { FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';
import { Device, ToDeviceMessage, ToHostMessage } from 'netled';

export class WebSocketManager {

    private _connections: Map<string, WsConnection[]> = new Map();

    public handler = async (socketStream: SocketStream, req: FastifyRequest) => {
        console.log('Incoming WS connection');

        const wsConnection: WsConnection = {
            type: req.url.endsWith('/device') ? 'device' : 'user',
            id: req.user.sub,
            socketStream
        };

        socketStream.socket.on('close', async () => {
            req.log.debug('WS Disconnected');

            const connections = this._connections.get(req.user.sub);
            console.assert(connections);
            if (!connections) { return; }

            const connectionIndex = connections.findIndex(c => c === wsConnection);
            console.assert(connectionIndex !== -1);
            if (connectionIndex === -1) { return; }

            connections.splice(connectionIndex, 1);
            if (!connections.length) {
                this._connections.delete(wsConnection.id);
            }

            if (wsConnection.type === 'device') {
                const device = await req.services.deviceDb.byId(wsConnection.id);
                console.assert(device);
                if (!device) { return; }

                device.status.wentOffline = Date.now();
                await req.services.deviceDb.replace(device);

                this.sendHostMessage(device.userId, {
                    type: 'deviceConnection',
                    deviceId: device.id,
                    data: {
                        state: 'disconnected'
                    }
                });
            }
        });

        socketStream.socket.on('message', (message: any) => {
            req.log.debug('Received WS message' + message);
        });

        let connections = this._connections.get(wsConnection.id);

        if (wsConnection.type === 'device' && connections?.length) {
            wsConnection.socketStream.destroy(new Error('Device already connected'));
        }

        if (!connections) { this._connections.set(wsConnection.id, (connections = [])); }

        connections.push(wsConnection);


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

            this.sendHostMessage(device.userId, {
                deviceId: device.id,
                type: 'deviceConnection',
                data: {
                    state: 'connected'
                }
            });

        }

    }

    public sendDeviceMessage(msg: ToDeviceMessage, ...deviceIds: [string, ...string[]]) {
        const msgJson = JSON.stringify(msg);
        for (const did of deviceIds) {
            const con = this._connections.get(did);
            if (!con?.length) { continue; }
            console.assert(con.length === 1);
            con[0].socketStream.socket.send(msgJson);
        }
    }

    public sendHostMessage(userId: string, msg: ToHostMessage) {
        const msgJson = JSON.stringify(msg);

        const userConnections = this._connections.get(userId);
        if (!userConnections?.length) { return; }

        userConnections.forEach(c => {
            c.socketStream.socket.send(msgJson);
        });

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