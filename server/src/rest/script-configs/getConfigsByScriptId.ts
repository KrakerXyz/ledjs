
import type { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';
import type { ScriptType } from '../../../../core/src/rest/model/ScriptConfig.js';

export const getConfigsByScriptId: RouteOptions = {
    method: 'GET',
    url: '/api/configs/:type/:scriptId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['animation', 'post-processor'] },
                scriptId: { type: 'string' }
            },
            required: ['type', 'scriptId']
        }
    },
    handler: async (req, res) => {
        const type = (req.params as any).type as ScriptType;
        const scriptId: Id = (req.params as any).scriptId;
        const version: number | undefined = (req.query as any).version;
        const db = req.services.scriptConfigDb;
        const allAsync = db.byScriptId(type, scriptId, req.user.sub, version);
        const all = await awaitAll(allAsync);
        await res.send(all);
    }
};