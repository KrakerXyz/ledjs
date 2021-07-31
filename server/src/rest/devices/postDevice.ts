import { RouteOptions } from 'fastify';
import { Device, DevicePost } from 'netled';
import { v4 } from 'uuid';
import { DeviceDb } from '../../db/DeviceDb';
import { jwtAuthentication, RequestUser } from '../../services';

export const postDevice: RouteOptions = {
    method: 'POST',
    url: '/api/devices',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {

        const user = req.user as RequestUser;

        const device = req.body as DevicePost;
        if (!device) {
            res.status(400).send('Missing body');
            return;
        }

        const db = new DeviceDb();

        const existingDevice = await db.byId(device.id);

        if (existingDevice && existingDevice.userId !== user.id) {
            res.send(409).send('A device with this id has already been created');
            return;
        }

        const newDevice: Device = {
            created: Date.now(),
            secret: v4(),
            userId: user.id,
            ...(existingDevice ?? {}),
            id: device.id,
            name: device.name
        };

        await (existingDevice ? db.replace : db.add).apply(db, [newDevice]);

        res.status(existingDevice ? 200 : 201).send(newDevice);
    }
};