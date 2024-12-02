
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';
import type { ScriptType } from '../../../../core/src/rest/model/ScriptConfig.js';

export const getConfigById: RouteOptions = {
    method: 'GET',
    url: '/api/configs/:type/:configId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['animation', 'post-processor'] },
                configId: { type: 'string' }
            },
            required: ['type', 'configId']
        }
    },
    handler: async (req, res) => {
        const type = (req.params as any).type as ScriptType;
        const configId: Id = (req.params as any).configId;
        const db = req.services.scriptConfigDb;
        const config = await db.byId(configId);

        if (!config) {
            await res.status(404).send({ error: 'A config with that id does not exist' });
            return;
        }

        if (config.type !== type) {
            await res.status(404).send({ error: 'Config type does not match URL type' });
            return;
        }

        if (config.userId !== req.user.sub) {
            await res.status(403).send({ error: 'User does not have access to this config' });
            return;
        }

        await res.send(config);
    }
};