import { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import { Device, DevicePost } from '../../../../core/src/rest/DeviceRestClient.js';
import { newId } from '../../../../core/src/index.js';

export const postDevice: RouteOptions = {
    method: 'POST',
    url: '/api/devices',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {

        const device = req.body as DevicePost;

        const db = req.services.deviceDb;

        const existingDevice = await db.byId(device.id);

        if (existingDevice && existingDevice.userId !== req.user.sub) {
            await res.send(409).send('A device with this id has already been created');
            return;
        }

        const newDevice: Device = {
            created: Date.now(),
            secret: newId(),
            userId: req.user.sub,
            status: {
                cameOnline: 0,
                wentOffline: 0,
            },
            id: device.id,
            name: device.name,
            isStopped: false,
            setup: device.setup,
            animation: existingDevice?.animation ?? null,
            animationConfigId: existingDevice?.animationConfigId ?? null
        };

        await db.upsert(newDevice);

        await res.status(existingDevice ? 200 : 201).send(newDevice);
    }
};