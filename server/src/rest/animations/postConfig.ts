import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { ScriptConfigPost, ScriptConfig } from '../../../../core/src/rest/model/ScriptConfig.js';

export const postConfig: RouteOptions = {
    method: 'POST',
    url: '/api/animations/configs',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const post = req.body as ScriptConfigPost;
        const db = req.services.scriptConfigDb;

        const existing = await db.byId(post.id);
        if (existing && existing.userId !== req.user.sub) {
            await res.status(401).send({ error: 'Config does not belong to you' });
            return;
        }

        const newConfig: ScriptConfig = {
            ...post,
            userId: req.user.sub,
        };

        await db.upsert(newConfig);

        await res.status(existing ? 200 : 201).send(newConfig);
    }
};