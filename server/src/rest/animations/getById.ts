import type { RouteOptions } from 'fastify';
import type { Id } from '../../../../core/src/rest/model/Id.js';

export const getById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/:version',
    schema: {
        params: {
            type: 'object',
            properties: {
                animationId: { type: 'string' },
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
            await res.status(404).send({ error: 'An animation with that id/version does not exist' });
            return;
        }

        await res.status(200).send(animation);
    }
};