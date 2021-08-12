import { RouteOptions } from 'fastify';
import { Device, DevicePost } from 'netled';
import { v4 } from 'uuid';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { jwtAuthentication } from '../../services';

export const postDevice: RouteOptions = {
    method: 'POST',
    url: '/api/devices',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<DevicePost>()
    },
    handler: async (req, res) => {

        const device = req.body as DevicePost;

        const db = req.services.deviceDb;

        const existingDevice = await db.byId(device.id);

        if (existingDevice && existingDevice.userId !== req.user.sub) {
            res.send(409).send('A device with this id has already been created');
            return;
        }

        const newDevice: Device = {
            created: Date.now(),
            secret: v4(),
            userId: req.user.sub,
            status: {
                cameOnline: 0,
                wentOffline: 0,
            },
            ...(existingDevice ?? {}),
            id: device.id,
            name: device.name,
            isStopped: false,
            setup: device.setup
        };

        await (existingDevice ? db.replace : db.add).apply(db, [newDevice]);

        res.status(existingDevice ? 200 : 201).send(newDevice);
    }
};