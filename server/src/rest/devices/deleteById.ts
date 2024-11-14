
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

export const deleteById: RouteOptions = {
    method: 'DELETE',
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
        const deviceId = (req.params as any)['deviceId'] as Id;

        const device = await req.services.deviceDb.byId(deviceId);
        if (!device) {
            await res.status(404).send({ error: 'A device with that id does not exist' });
            return;
        }

        if (device.userId !== req.user.sub) {
            await res.status(403).send({ error: 'Device does not belong to authorized user' });
            return;
        }

        await req.services.deviceDb.deleteById(device.id);

        await res.status(200).send();
    }
};