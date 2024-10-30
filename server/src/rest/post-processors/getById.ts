import type { RouteOptions } from 'fastify';
import type { Id } from '../../../../core/src/rest/model/Id.js';

export const getById: RouteOptions = {
    method: 'GET',
    url: '/api/post-processors/:postProcessorId/:version',
    schema: {
        params: {
            type: 'object',
            properties: {
                postProcessorId: { type: 'string' },
                version: { type: 'number' }
            },
            required: ['postProcessorId', 'version']
        }
    },
    handler: async (req, res) => {
        const postProcessorId = (req.params as any)['postProcessorId'] as Id;
        const version = (req.params as any)['version'] as number;

        const db = req.services.postProcessorDb;
        const postProcessor = await db.byId(postProcessorId, version);
        if (!postProcessor) {
            await res.status(404).send({ error: 'An postProcessor with that id/version does not exist' });
            return;
        }

        await res.status(200).send(postProcessor);
    }
};