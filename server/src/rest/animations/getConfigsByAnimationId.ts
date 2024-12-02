import type { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

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
        const db = req.services.scriptConfigDb;
        const allAsync = db.byScriptId('animation', animationId, req.user.sub, version);
        const all = await awaitAll(allAsync);
        await res.send(all);
    }
};