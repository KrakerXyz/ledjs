import { RouteHandler } from 'fastify'
import { AnimationDb } from '../db'
import { awaitAll } from '../services';
import { Animation, AnimationPost, parseScript } from 'netled';

export const get: RouteHandler = async (req, res) => {
    const db = new AnimationDb();
    const all = await awaitAll(db.all());
    res.send(all);
}

export const post: RouteHandler = async (req, res) => {
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

    const existingAnimation = await db.byId(animationPost.id);

    const animation: Animation = {
        ...animationPost,
        published: false,
        version: (existingAnimation?.version ?? -1) + 1,
        created: Date.now(),
        author: 'TestUser'
    };

    await db.add(animation);

    const { script, ...animationMeta } = animation;

    res.send(201).send(animationMeta);

}