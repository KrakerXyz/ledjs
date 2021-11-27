import { RouteOptions } from 'fastify';
import { Id } from '@krakerxyz/netled-core';
import { jwtAuthentication } from '../../services';

export const getDevice: RouteOptions = {
    method: 'GET',
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

        const deviceId = (req.params as any).deviceId as Id;

        const db = req.services.deviceDb;
        const device = await db.byId(deviceId);

        if (!device) {
            res.status(404).send('Device with that id does not exist');
            return;
        }

        if (device.userId !== req.user.sub) {
            res.status(403).send('User does not have access to this device');
            return;
        }

        res.send(device);
    }
};