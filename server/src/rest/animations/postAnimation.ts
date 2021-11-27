import { RouteOptions } from 'fastify';
import { AnimationPost, parseScript, Animation } from '@krakerxyz/netled-core';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { jwtAuthentication } from '../../services';

export const postAnimation: RouteOptions = {
    method: 'POST',
    url: '/api/animations',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<AnimationPost>()
    },
    handler: async (req, res) => {
        const animationPost = req.body as AnimationPost;

        const db = req.services.animationDb;

        const parseResult = parseScript(animationPost.script);

        if (parseResult.valid === false) {
            res.status(400).send({ error: `Script contains errors: ${JSON.stringify(parseResult.errors)}` });
            return;
        }

        const existing = await db.latestById(animationPost.id, true);

        const animation: Animation = {
            ...animationPost,
            published: false,
            version: existing?.published ? existing.version + 1 : (existing?.version ?? 0),
            created: Date.now(),
            author: req.user.sub
        };

        await (existing ? db.replace : db.add).apply(db, [animation]);

        const { script, ...animationMeta } = animation;

        res.status(existing ? 200 : 201).send(animationMeta);

    }
};