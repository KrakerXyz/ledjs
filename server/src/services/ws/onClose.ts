import { DeviceConnectionEvent, newId } from '@krakerxyz/netled-core';
import { FastifyRequest } from 'fastify';
import { WsConnection } from './WebSocketManager';

export function onClose(
    wsConnection: WsConnection,
    req: FastifyRequest
) {

    const log = req.log.child({ name: 'services.ws.onClose' });

    return async () => {
        log.info('WS %s:%s disconnected', wsConnection.type, wsConnection.id);

        const wsManager = req.services.webSocketManager;

        const connections = wsManager.connections.get(req.user.sub);
        console.assert(connections);
        if (!connections) { return; }

        const connectionIndex = connections.findIndex(c => c === wsConnection);
        console.assert(connectionIndex !== -1);
        if (connectionIndex === -1) { return; }

        connections.splice(connectionIndex, 1);
        if (!connections.length) {
            wsManager.connections.delete(wsConnection.id);
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
                    id: newId(),
                    data: wsEvent
                }),
                req.services.deviceDb.replace(device)
            ]);

            wsManager.sendHostMessage(device.userId, wsEvent);
        }
    };
}