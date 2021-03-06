import { RouteOptions } from 'fastify';
import { Id } from '@krakerxyz/netled-core';

export const getById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/:version',
    schema: {
        params: {
            type: 'object',
            properties: {
                animationId: { type: 'string', format: 'uuid' },
                version: { type: 'number' }
            },
            required: ['animationId', 'version']
        }
    },
    handler: async (req, res) => {
        const animationId = (req.params as any)['animationId'] as Id;
        const version = (req.params as any)['version'] as number;

        const db = req.services.animationDb;
        const animation = await db.byId(animationId, version);
        if (!animation) {
            res.status(404).send({ error: 'An animation with that id/version does not exist' });
            return;
        }

        res.status(200).send(animation);
    }
};