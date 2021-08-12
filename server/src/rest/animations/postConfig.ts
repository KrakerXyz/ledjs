import { RouteOptions } from 'fastify';
import { AnimationNamedConfig, AnimationNamedConfigPost } from 'netled';
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

        if (!post) {
            res.status(400).send({ error: 'Missing animationNamedConfigPost body' });
            return;
        }

        const existing = await db.byId(post.id);
        if (existing && existing.userId !== req.user.sub) {
            res.status(401).send({ error: 'Config does not belong to you' });
            return;
        }

        const newConfig: AnimationNamedConfig = {
            ...post,
            userId: req.user.sub,
        };

        await (existing ? db.replace : db.add).apply(db, [newConfig]);

        res.status(existing ? 200 : 201).send(newConfig);
    }
};