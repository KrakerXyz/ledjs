import { RouteOptions } from '@fastify/websocket';
import { Device, DeviceAnimationPost } from '@krakerxyz/netled-core';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { jwtAuthentication } from '../../services';

export const postAnimation: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<DeviceAnimationPost>()
    },
    handler: async (req, res) => {

        const db = req.services.deviceDb;

        const deviceSetup = req.body as DeviceAnimationPost;

        const devices = await Promise.all(deviceSetup.deviceIds.map(did => db.byId(did)));

        if (devices.some(d => !d)) {
            await res.status(400).send('One or more devices did not exist');
            return;
        }

        if (devices.some(d => d?.userId !== req.user.sub)) {
            await res.status(403).send('User does not have access to one or more devices');
            return;
        }

        const config = !deviceSetup.configId ? null : await req.services.animationConfigDb.byId(deviceSetup.configId);

        const updateProms: Promise<any>[] = [];
        for (const d of devices) {
            if (!d) { continue; }
            const newDevice: Device = {
                ...d,
                animation: deviceSetup.animation
            };
            updateProms.push(db.replace(newDevice));
        }

        req.services.webSocketManager.sendDeviceMessage({
            type: 'animationSetup',
            data: config
        }, ...deviceSetup.deviceIds);

        await res.send();

    }
};