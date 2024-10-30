
import type { RouteOptions } from 'fastify';
import type { Id } from '../../../../core/src/rest/model/Id.js';

interface Params { postProcessorId: Id }
interface Query { includeDraft?: boolean }

export const getLatestById: RouteOptions = {
    method: 'GET',
    url: '/api/post-processors/:postProcessorId',
    handler: async (req, res) => {
        const params = req.params as Params;
        const query = req.query as Query;
        const db = req.services.postProcessorDb;
        let postProcessor = query.includeDraft ? await db.byId(params.postProcessorId, 'draft') : null;
        if (!postProcessor) { postProcessor = await db.latestById(params.postProcessorId); }
        if (!postProcessor) {
            await res.status(404).send({ error: `PostProcessor ${params.postProcessorId} does not exist` });
            return;
        }

        await res.status(200).send(postProcessor);
    }
};