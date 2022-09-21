import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { Id } from '@krakerxyz/netled-core';
import { RouteOptions } from 'fastify';

type Params = { postProcessorId: Id };
type Query = { includeDraft?: boolean };

export const getLatestById: RouteOptions = {
    method: 'GET',
    url: '/api/post-processors/:postProcessorId',
    schema: {
        params: jsonSchema<Params>(),
        querystring: jsonSchema<Query>()
    },
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