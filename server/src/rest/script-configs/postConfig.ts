
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { ScriptConfigPost, ScriptConfig, ScriptType } from '../../../../core/src/rest/model/ScriptConfig.js';

export const postConfig: RouteOptions = {
    method: 'POST',
    url: '/api/configs/:type',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['animation', 'post-processor'] }
            },
            required: ['type']
        }
    },
    handler: async (req, res) => {
        const type = (req.params as any).type as ScriptType;
        const post = req.body as ScriptConfigPost;

        if (post.type !== type) {
            await res.status(400).send({ error: 'Config type must match URL type' });
            return;
        }

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