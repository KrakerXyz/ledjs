import { Id } from '../../../../core/src/index.js';
import { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';

export const getConfigsByAnimationId: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/configs',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                animationId: { type: 'string' }
            },
            required: ['animationId']
        }
    },
    handler: async (req, res) => {
        const animationId: Id = (req.params as any).animationId;
        const version: number | undefined = (req.query as any).version;
        const db = req.services.animationConfigDb;
        const allAsync = db.byAnimationId(animationId, req.user.sub, version);
        const all = await awaitAll(allAsync);
        await res.send(all);
    }
};