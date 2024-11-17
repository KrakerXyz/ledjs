import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

export const getDevice: RouteOptions = {
    method: 'GET',
    url: '/api/devices/:deviceId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                deviceId: { type: 'string' }
            },
            required: ['deviceId']
        }
    },
    handler: async (req, res) => {

        const deviceId = (req.params as any).deviceId as Id;

        const db = req.services.deviceDb;
        const device = await db.byId(deviceId);

        if (!device) {
            await res.status(404).send('Device with that id does not exist');
            return;
        }

        if (device.userId !== req.user.sub && device.id !== req.user.sub) {
            await res.status(403).send('User does not have access to this device');
            return;
        }

        await res.send(device);
    }
};