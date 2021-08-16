import { FastifyLoggerInstance, FastifyRequest } from 'fastify';
import { SocketStream } from 'fastify-websocket';
import { Device, DeviceConnectionEvent, FromDeviceMessage, Id, ToDeviceMessage, ToHostMessage } from 'netled';
import { v4 } from 'uuid';
import { DeviceLogDb } from '../db';
import { RequestServicesContainer } from './RequestServicesContainer';

export class WebSocketManager {

    public constructor(private _log: FastifyLoggerInstance) {

    }

    private _connections: Map<string, WsConnection[]> = new Map();

    public handler = async (socketStream: SocketStream, req: FastifyRequest) => {

        const wsConnection: WsConnection = {
            type: req.url.endsWith('/device') ? 'device' : 'user',
            id: req.user.sub,
            socketStream
        };

        this._log.info('Incoming WS connection for %s:%s', wsConnection.type, wsConnection.id);

        socketStream.socket.on('close', async () => {
            this._log.info('WS %s:%s disconnected', wsConnection.type, wsConnection.id);

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

                const wsEvent: DeviceConnectionEvent = {
                    type: 'deviceConnection',
                    data: {
                        deviceId: device.id,
                        state: 'disconnected'
                    }
                };

                device.status.wentOffline = Date.now();
                await Promise.all([
                    req.services.deviceLogDb.add({
                        created: Date.now(),
                        deviceId: device.id,
                        from: 'server',
                        id: v4() as Id,
                        data: wsEvent
                    }),
                    req.services.deviceDb.replace(device)
                ]);

                this.sendHostMessage(device.userId, wsEvent);
            }
        });

        wsConnection.socketStream.socket.on('message', async (json: string) => {
            this._log.info('WS message from %s:%s', wsConnection.type, wsConnection.id);

            if (wsConnection.type === 'device') {
                const msg: FromDeviceMessage = JSON.parse(json);
                console.log('Device message', msg);

                const device = await req.services.deviceDb.byId(wsConnection.id);
                console.assert(device);
                if (!device) { return; }

                const logProm = req.services.deviceLogDb.add({
                    id: v4() as Id,
                    deviceId: device.id,
                    created: Date.now(),
                    from: 'device',
                    data: msg
                });

                if (msg.type !== 'info') {
                    device.status.lastContact = Date.now();
                    await req.services.deviceDb.replace(device);
                }

                this.sendHostMessage(device.userId, {
                    type: 'deviceMessage',
                    data: {
                        deviceId: device.id,
                        ...msg
                    }
                });


                await logProm;
            }
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
                this.initializeDevice(device, req.services);
            }, 100);

            device.status.cameOnline = Date.now();
            device.status.lastContact = Date.now();
            device.status.wanIp = req.ip;

            const wsEvent: DeviceConnectionEvent = {
                type: 'deviceConnection',
                data: {
                    deviceId: device.id,
                    state: 'connected'
                }
            };

            await Promise.all([
                req.services.deviceDb.replace(device),
                req.services.deviceLogDb.add({
                    created: Date.now(),
                    deviceId: device.id,
                    from: 'server',
                    id: v4() as Id,
                    data: wsEvent
                })
            ]);

            this.sendHostMessage(device.userId, wsEvent);

        }

    }

    public async sendDeviceMessage(msg: ToDeviceMessage, ...deviceIds: [Id, ...Id[]]) {
        this._log.trace('Sending %s message to device %s', msg.type, deviceIds.join(', '));
        const msgJson = JSON.stringify(msg);

        const deviceLogDb = new DeviceLogDb();
        const logProms: Promise<any>[] = [];
        for (const did of deviceIds) {
            const con = this._connections.get(did);
            if (!con?.length) { continue; }
            console.assert(con.length === 1);
            con[0].socketStream.socket.send(msgJson);

            logProms.push(deviceLogDb.add({
                id: v4() as Id,
                created: Date.now(),
                deviceId: did,
                from: 'server',
                data: {
                    type: 'websocketSendMessage',
                    msgType: msg.type
                }
            }));
        }

        await Promise.all(logProms);
    }

    public sendHostMessage(userId: Id, msg: ToHostMessage) {
        const msgJson = JSON.stringify(msg);

        const userConnections = this._connections.get(userId);
        if (!userConnections?.length) { return; }

        userConnections.forEach(c => {
            c.socketStream.socket.send(msgJson);
        });

    }

    private async initializeDevice(device: Device, services: RequestServicesContainer) {

        if (!device) { return; }

        this._log.info('Sending %s initial deviceSetup', device.id);
        this.sendDeviceMessage({
            type: 'deviceSetup',
            data: {
                ...device.setup
            }
        }, device.id);

        if (device.animationNamedConfigId) {

            const config = await services.animationConfigDb.byId(device.animationNamedConfigId);
            console.assert(config);
            if (!config) { return; }

            this.sendDeviceMessage({
                type: 'animationSetup',
                data: config?.animation
            }, device.id);
        }

        this.sendDeviceMessage({
            type: 'animationStop',
            data: { stop: device.isStopped }
        }, device.id);

    }

}

interface WsConnection {
    type: 'device' | 'user';
    id: Id;
    socketStream: SocketStream;
}