import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { AnimationSummary } from '@krakerxyz/netled-core';
import { RouteOptions } from 'fastify';
import { awaitAll } from '../../services';

export const getAnimations: RouteOptions = {
    method: 'GET',
    url: '/api/animations',
    schema: {
        response: {
            '2xx': jsonSchema<AnimationSummary[]>()
        }
    },
    handler: async (req, res) => {
        const db = req.services.animationDb;
        const all = await awaitAll(db.all());

        await res.send(all);
    }
};