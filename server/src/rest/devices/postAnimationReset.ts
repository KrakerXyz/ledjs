import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { DeviceAnimationResetPost } from '../../../../core/src/rest/DeviceRestClient.js';
import type { AnimationConfig } from '../../../../core/src/rest/model/AnimationConfig.js';

export const postAnimationReset: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation/reset',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {

        const post = req.body as DeviceAnimationResetPost;

        const devices = await Promise.all(post.deviceIds.map(deviceId => req.services.deviceDb.byId(deviceId)));

        if (devices.some(d => !d)) {
            await res.status(400).send({ error: 'One or more devices not found' });
            return;
        }

        if (devices.some(d => d!.userId !== req.user.sub)) {
            await res.status(403).send({ error: 'Access denied to one or more devices' });
            return;
        }

        const configs: Record<string, AnimationConfig | null> = {};

        for (const d of devices) {
            if (!d) { continue; }

            if (d.animationConfigId) {

                let config = configs[d.animationConfigId];
                if (config === undefined) {
                    config = await req.services.animationConfigDb.byId(d.animationConfigId);
                    configs[d.animationConfigId] = config;
                }


            }

        }

        await res.send();

    }
};