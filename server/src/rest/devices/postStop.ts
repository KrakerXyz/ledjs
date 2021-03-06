import { RouteOptions } from 'fastify';
import { DeviceStopPost } from '@krakerxyz/netled-core';
import { jwtAuthentication } from '../../services';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';

export const postStop: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation/stop',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<DeviceStopPost>()
    },
    handler: async (req, res) => {

        const db = req.services.deviceDb;

        const deviceSetup = req.body as DeviceStopPost;

        const devices = await Promise.all(deviceSetup.deviceIds.map(did => db.byId(did)));

        if (devices.some(d => !d)) {
            res.status(400).send('One or more devices did not exist');
            return;
        }

        if (devices.some(d => d?.userId !== req.user.sub)) {
            res.status(403).send('User does not have access to one or more devices');
            return;
        }

        const updateProms: Promise<any>[] = [];

        if (deviceSetup.persist !== false) {
            for (const d of devices) {
                if (!d) { continue; }
                const newDevice = {
                    ...d,
                    isStopped: deviceSetup.stop
                };
                updateProms.push(db.replace(newDevice));
            }
        }

        req.services.webSocketManager.sendDeviceMessage({
            type: 'animationStop',
            data: { stop: deviceSetup.stop }
        }, ...deviceSetup.deviceIds);

        await Promise.all(updateProms);

        res.send();

    }
};