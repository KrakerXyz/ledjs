import { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import { DeviceAnimationConfigPost } from '../../../../core/src/rest/model/DeviceAnimationConfig.js';

export const postAnimationConfig: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation-config',
    preValidation: [jwtAuthentication],
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
            d.animationConfigId = post.configId;
            deviceSaves.push(req.services.deviceDb.replace(d));
        }

        req.services.webSocketManager.sendDeviceMessage({
            type: 'animationSetup',
            data: config
        }, ...post.deviceIds);

        await Promise.all(deviceSaves);

        await res.send();

    }
};