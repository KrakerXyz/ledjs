import { Id } from '@krakerxyz/netled-core';
import { RouteOptions } from 'fastify';
import { awaitAll, jwtAuthentication } from '../../services';

export const getConfigsByAnimationId: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/configs',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                animationId: { type: 'string', format: 'uuid' }
            },
            required: ['animationId']
        },
        querystring: {
            version: { type: 'number', min: 0 }
        }
    },
    handler: async (req, res) => {
        const animationId: Id = (req.params as any).animationId;
        const version: number | undefined = (req.query as any).version;
        const db = req.services.animationConfigDb;
        const allAsync = db.byAnimationId(animationId, req.user.sub, version);
        const all = await awaitAll(allAsync);
        res.send(all);
    }
};