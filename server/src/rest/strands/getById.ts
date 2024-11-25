import type { RouteOptions } from 'fastify';
import type { Id } from '../../../../core/src/rest/model/Id.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';

export const getById: RouteOptions = {
    method: 'GET',
    url: '/api/strands/:strandId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                strandId: { type: 'string', format: 'uuid' }
            },
            required: ['strandId']
        }
    },
    handler: async (req, res) => {
        const strandId = (req.params as any)['strandId'] as Id;

        const db = req.services.strandDb;
        const strand = await db.byId(strandId);
        if (!strand) {
            await res.status(404).send({ error: 'An strand with that id does not exist' });
            return;
        }

        if (strand.author !== req.user.userId) {
            await res.status(403).send({ error: 'User does not have access to this strand' });
            return;
        }

        await res.status(200).send(strand);
    }
};