import { RouteOptions } from 'fastify';
import { AnimationPost, parseScript, Animation } from 'netled';
import { AnimationDb } from '../../db';

export const postAnimation: RouteOptions = {
    method: 'POST',
    url: '/api/animations',
    handler: async (req, res) => {
        const animationPost = req.body as AnimationPost;
        if (!animationPost) {
            res.status(400).send({ error: 'Missing animationPost body' });
            return;
        } else if (!animationPost.script?.trim()) {
            res.send(400).send({ error: 'Missing script' });
            return;
        } else if (!animationPost.id) {
            res.send(400).send({ error: 'Missing id' });
            return;
        }

        const db = new AnimationDb();

        const parseResult = parseScript(animationPost.script);

        if (parseResult.valid === false) {
            res.status(400).send({ error: `Script contains errors: ${JSON.stringify(parseResult.errors)}` });
            return;
        }

        const existingAnimation = await db.latestById(animationPost.id, true);

        const animation: Animation = {
            ...animationPost,
            published: false,
            version: existingAnimation?.published ? existingAnimation.version + 1 : (existingAnimation?.version ?? 0),
            created: Date.now(),
            author: 'TestUser'
        };

        if (existingAnimation) {
            await db.replace(animation);
        } else {
            await db.add(animation);
        }

        const { script, ...animationMeta } = animation;

        res.send(201).send(animationMeta);

    }
};