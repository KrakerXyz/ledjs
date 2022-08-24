import { RouteOptions } from 'fastify';
import { AnimationNamedConfig, AnimationNamedConfigPost } from '@krakerxyz/netled-core';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { jwtAuthentication } from '../../services';

export const postConfig: RouteOptions = {
    method: 'POST',
    url: '/api/animations/configs',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<AnimationNamedConfigPost>()
    },
    handler: async (req, res) => {
        const post = req.body as AnimationNamedConfigPost;
        const db = req.services.animationConfigDb;

        const existing = await db.byId(post.id);
        if (existing && existing.userId !== req.user.sub) {
            await res.status(401).send({ error: 'Config does not belong to you' });
            return;
        }

        const newConfig: AnimationNamedConfig = {
            ...post,
            userId: req.user.sub,
        };

        await (existing ? db.replace : db.add).apply(db, [newConfig]);

        if (existing) {
            const devices = req.services.deviceDb.byAnimationNamedConfigId(newConfig.id);
            for await (const d of devices) {
                req.services.webSocketManager.sendDeviceMessage({
                    type: 'animationSetup',
                    data: newConfig.animation
                }, d.id);
            }
        }

        await res.status(existing ? 200 : 201).send(newConfig);
    }
};