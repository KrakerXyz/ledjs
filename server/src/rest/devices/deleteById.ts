
import { RouteOptions } from 'fastify';
import { Id } from 'netled';
import { jwtAuthentication } from '../../services';

export const deleteById: RouteOptions = {
    method: 'DELETE',
    url: '/api/devices/:deviceId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                deviceId: { type: 'string', format: 'uuid' }
            },
            required: ['deviceId']
        }
    },
    handler: async (req, res) => {
        const deviceId = (req.params as any)['deviceId'] as Id;

        const device = await req.services.deviceDb.byId(deviceId);
        if (!device) {
            res.status(404).send({ error: 'A device with that id does not exist' });
            return;
        }

        if (device.userId !== req.user.sub) {
            res.status(403).send({ error: 'Device does not belong to authorized user' });
            return;
        }

        await req.services.deviceDb.deleteById(device.id);
        req.services.webSocketManager.disconnectDevice(device.id);

        res.status(200).send();
    }
};