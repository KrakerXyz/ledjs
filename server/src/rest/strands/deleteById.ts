
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

interface Params { strandId: Id }

export const deleteById: RouteOptions = {
    method: 'DELETE',
    url: '/api/strands/:strandId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                strandId: { type: 'string', format: 'uuid' }
            },
            required: ['strandId'],
        }
    },
    handler: async (req, res) => {
        const params = req.params as Params;

        const db = req.services.strandDb;
        const strand = await db.byId(params.strandId);
        if (!strand) {
            await res.status(404).send({ error: `A strand ${params.strandId} does not exist` });
            return;
        }

        if (strand.author !== req.user.sub) {
            await res.status(403).send({ error: 'Strand does not belong to authorized user' });
            return;
        }

        await db.deleteById(strand.id);

        await res.status(200).send();
    }
};