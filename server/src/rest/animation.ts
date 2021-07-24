import { RouteHandler } from 'fastify'
import { AnimationDb } from '../db'
import { awaitAll } from '../services';
import { Animation, AnimationPost, parseScript } from 'netled';

export const get: RouteHandler = async (req, res) => {
    const db = new AnimationDb();
    const all = await awaitAll(db.all());
    res.send(all);
}

export const getById: RouteHandler = async (req, res) => {
    const animationId = (req.params as any)['animationId'];
    const db = new AnimationDb();
    const animation = await db.latestById(animationId, (req.query as any)['includeDraft'] === 'true');
    if (!animation) {
        res.status(404).send({ error: 'An animation with that id does not exist' });
        return;
    }

    res.status(200).send(animation);
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