import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { PostProcessorSummary } from '@krakerxyz/netled-core';
import { RouteOptions } from 'fastify';
import { awaitAll } from '../../services';

export const getPostProcessors: RouteOptions = {
    method: 'GET',
    url: '/api/post-processors',
    schema: {
        response: {
            '2xx': jsonSchema<PostProcessorSummary[]>()
        }
    },
    handler: async (req, res) => {
        const db = req.services.postProcessorDb;
        const all = await awaitAll(db.all());

        await res.send(all);
    }
};