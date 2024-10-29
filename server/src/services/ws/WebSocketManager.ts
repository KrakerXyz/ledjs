import { FastifyBaseLogger, FastifyRequest } from 'fastify';
import { v4 } from 'uuid';
import { DeviceLogDb } from '../../db/DeviceLogDb.js';
import { assertTruthy } from '../assert.js';
import { RequestServicesContainer } from '../RequestServicesContainer.js';
import { onClose } from './onClose.js';
import { Id } from '../../../../core/src/index.js';
import { Device } from '../../../../core/src/rest/DeviceRestClient.js';
import { FromDeviceMessage } from '../../../../core/src/ws/FromDeviceMessage.js';
import { DeviceConnectionEvent, ToHostMessage } from '../../../../core/src/ws/HostMessages.js';
import { ToDeviceMessage } from '../../../../core/src/ws/ToDeviceMessages.js';

export class WebSocketManager {

    public constructor(private _rootLog: FastifyBaseLogger) {

    }

    public readonly connections: Map<string, WsConnection[]> = new Map();

    public handler = async (conn: WebSocket, req: FastifyRequest, ..._params: any[]) => {

        const log = req.log.child({ name: 'services.ws.WebSocketManager.handler' });

        const wsConnection: WsConnection = {
            type: req.url.endsWith('/device') ? 'device' : 'user',
            id: req.user.sub,
            socket: conn
        };

        log.info('Incoming WS connection for %s:%s', wsConnection.type, wsConnection.id);

        req.socket.on('close', onClose(wsConnection, req));

        req.socket.on('message', async (json: string) => {
            log.info('WS message from %s:%s', wsConnection.type, wsConnection.id);

            if (wsConnection.type === 'device') {
                const msg: FromDeviceMessage = JSON.parse(json);
                log.debug('Device message', msg);

                const device = await req.services.deviceDb.byId(wsConnection.id);
                assertTruthy(device);

                const logProm = req.services.deviceLogDb.add({
                    id: v4() as Id,
                    deviceId: device.id,
                    created: Date.now(),
                    from: 'device',
                    data: msg as any
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

        let connections = this.connections.get(wsConnection.id);

        if (wsConnection.type === 'device' && connections?.length) {
            wsConnection.socket.close(4000, 'Only one device connection allowed');
        }

        if (!connections) { this.connections.set(wsConnection.id, (connections = [])); }

        connections.push(wsConnection);

        if (wsConnection.type === 'device') {

            const device = await req.services.deviceDb.byId(wsConnection.id);
            assertTruthy(device);

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

    };

    public async sendDeviceMessage(msg: ToDeviceMessage, ...deviceIds: [Id, ...Id[]]) {
        this._rootLog.trace('Sending %s message to device %s', msg.type, deviceIds.join(', '));
        const msgJson = JSON.stringify(msg);

        const deviceLogDb = new DeviceLogDb();
        const logProms: Promise<any>[] = [];
        for (const did of deviceIds) {
            const con = this.connections.get(did);
            if (!con?.length) { continue; }
            console.assert(con.length === 1);
            (con[0].socket as any).send(msgJson);

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

    public async disconnectDevice(deviceId: Id) {
        const con = this.connections.get(deviceId);
        if (!con?.length) { return; }
        con.forEach(c => c.socket.close());
    }

    public sendHostMessage(userId: Id, msg: ToHostMessage) {
        const msgJson = JSON.stringify(msg);

        const userConnections = this.connections.get(userId);
        if (!userConnections?.length) { return; }

        userConnections.forEach(c => {
            (c.socket as any).send(msgJson);
        });

    }

    private async initializeDevice(device: Device, services: RequestServicesContainer) {

        if (!device) { return; }

        this._rootLog.info('Sending %s initial deviceSetup', device.id);
        this.sendDeviceMessage({
            type: 'deviceSetup',
            data: {
                ...device.setup
            }
        }, device.id);

        if (device.animationConfigId) {

            const config = await services.animationConfigDb.byId(device.animationConfigId);
            assertTruthy(config);

            this.sendDeviceMessage({
                type: 'animationSetup',
                data: config
            }, device.id);
        }

        this.sendDeviceMessage({
            type: 'animationStop',
            data: { stop: device.isStopped }
        }, device.id);

    }

}

export interface WsConnection {
    type: 'device' | 'user';
    id: Id;
    socket: WebSocket;
}