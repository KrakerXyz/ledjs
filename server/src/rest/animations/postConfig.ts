import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { AnimationConfigPost, AnimationConfig } from '../../../../core/src/rest/model/AnimationConfig.js';

export const postConfig: RouteOptions = {
    method: 'POST',
    url: '/api/animations/configs',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const post = req.body as AnimationConfigPost;
        const db = req.services.animationConfigDb;

        const existing = await db.byId(post.id);
        if (existing && existing.userId !== req.user.sub) {
            await res.status(401).send({ error: 'Config does not belong to you' });
            return;
        }

        const newConfig: AnimationConfig = {
            ...post,
            userId: req.user.sub,
        };

        await db.upsert(newConfig);

        if (existing) {
            const devices = req.services.deviceDb.byAnimationConfigId(newConfig.id);
            for await (const d of devices) {
                req.services.webSocketManager.sendDeviceMessage({
                    type: 'animationSetup',
                    data: newConfig
                }, d.id);
            }
        }

        await res.status(existing ? 200 : 201).send(newConfig);
    }
};