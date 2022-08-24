import { RouteOptions } from 'fastify';
import { DeviceAnimationConfigPost } from '@krakerxyz/netled-core';
import { jwtAuthentication } from '../../services';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';

export const postAnimationConfig: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation-config',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<DeviceAnimationConfigPost>()
    },
    handler: async (req, res) => {
        const post = req.body as DeviceAnimationConfigPost;

        const devices = await Promise.all(post.deviceIds.map(deviceId => req.services.deviceDb.byId(deviceId)));

        if (devices.some(d => !d)) {
            await res.status(400).send({ error: 'One or more devices not found' });
            return;
        }

        if (devices.some(d => d!.userId !== req.user.sub)) {
            await res.status(403).send({ error: 'Access denied to one or more devices' });
            return;
        }

        const config = post.configId ? await req.services.animationConfigDb.byId(post.configId) : null;
        if (post.configId) {
            if (!config) {
                await res.status(400).send({ error: 'Animation config does not exist' });
                return;
            }

            if (config.userId !== req.user.sub) {
                await res.status(403).send({ error: 'Access denied to animation config' });
                return;
            }
        }

        const deviceSaves: Promise<any>[] = [];
        for (const d of devices) {
            if (!d) { continue; }
            d.animationNamedConfigId = post.configId ?? undefined;
            deviceSaves.push(req.services.deviceDb.replace(d));
        }

        req.services.webSocketManager.sendDeviceMessage({
            type: 'animationSetup',
            data: config?.animation ?? null
        }, ...post.deviceIds);

        await Promise.all(deviceSaves);

        await res.send();

    }
};