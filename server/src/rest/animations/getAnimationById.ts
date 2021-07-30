import { RouteOptions } from 'fastify';
import { AnimationDb } from '../../db';

export const getAnimationById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId',
    handler: async (req, res) => {
        const animationId = (req.params as any)['animationId'];
        const db = new AnimationDb();
        const animation = await db.latestById(animationId, (req.query as any)['includeDraft'] === 'true');
        if (!animation) {
            res.status(404).send({ error: 'An animation with that id does not exist' });
            return;
        }

        res.status(200).send(animation);
    }
};