import { RouteOptions } from 'fastify';
import { AnimationDb } from '../../db';

export const getScriptById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/script',
    handler: async (req, res) => {
        const animationId = (req.params as any)['animationId'];

        const version = parseInt((req.query as any).version ?? '-1');
        if (version === -1) {
            res.status(400).send({ error: 'Missing or invalid version query parameter' });
            return;
        }

        const db = new AnimationDb();
        const animation = await db.byId(animationId, version);
        if (!animation) {
            res.status(404).send({ error: 'An animation with that id/version does not exist' });
            return;
        }

        res.status(200).header('Content-Type', 'text/javascript').send(animation.script);
    }
};