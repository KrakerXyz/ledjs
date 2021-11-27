import { RouteOptions } from 'fastify';
import { AnimationNamedConfig, DeviceAnimationResetPost } from '@krakerxyz/netled-core';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { jwtAuthentication } from '../../services';

export const postAnimationReset: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation/reset',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<DeviceAnimationResetPost>()
    },
    handler: async (req, res) => {

        const post = req.body as DeviceAnimationResetPost;

        const devices = await Promise.all(post.deviceIds.map(deviceId => req.services.deviceDb.byId(deviceId)));

        if (devices.some(d => !d)) {
            res.status(400).send({ error: 'One or more devices not found' });
            return;
        }

        if (devices.some(d => d!.userId !== req.user.sub)) {
            res.status(403).send({ error: 'Access denied to one or more devices' });
            return;
        }

        const configs: Record<string, AnimationNamedConfig | null> = {};

        for (const d of devices) {
            if (!d) { continue; }

            let hadConfig = false;
            if (d.animationNamedConfigId) {

                let config = configs[d.animationNamedConfigId];
                if (config === undefined) {
                    config = await req.services.animationConfigDb.byId(d.animationNamedConfigId);
                    configs[d.animationNamedConfigId] = config;
                }

                if (config) {
                    hadConfig = true;
                    req.services.webSocketManager.sendDeviceMessage({
                        type: 'animationSetup',
                        data: config.animation
                    }, d.id);
                }

            }

            req.services.webSocketManager.sendDeviceMessage({
                type: 'animationStop',
                data: {
                    stop: d.isStopped
                }
            }, d.id);

            if (!hadConfig) {
                //If they didn't have a config, clear out the current animation
                req.services.webSocketManager.sendDeviceMessage({
                    type: 'animationSetup',
                    data: null
                }, d.id);
            }
        }

        res.send();

    }
};