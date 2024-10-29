
import { Id } from '../../../../core/src/index.js';
import { RouteOptions } from 'fastify';

type Params = { animationId: Id };
type Query = { includeDraft?: boolean };

export const getLatestById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId',
    handler: async (req, res) => {
        const params = req.params as Params;
        const query = req.query as Query;
        const db = req.services.animationDb;
        let animation = query.includeDraft ? await db.byId(params.animationId, 'draft') : null;
        if (!animation) { animation = await db.latestById(params.animationId); }
        if (!animation) {
            await res.status(404).send({ error: `Animation ${params.animationId} does not exist` });
            return;
        }

        await res.status(200).send(animation);
    }
};