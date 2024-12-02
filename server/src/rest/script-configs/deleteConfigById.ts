
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';
import type { ScriptType } from '../../../../core/src/rest/model/ScriptConfig.js';

export const deleteConfigById: RouteOptions = {
    method: 'DELETE',
    url: '/api/configs/:type/:configId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['animation', 'post-processor'] },
                configId: { type: 'string', format: 'uuid' }
            },
            required: ['type', 'configId']
        }
    },
    handler: async (req, res) => {
        const type = (req.params as any).type as ScriptType;
        const configId = (req.params as any).configId as Id;
        const config = await req.services.scriptConfigDb.byId(configId);

        if (!config) {
            await res.status(404).send({ error: 'A config with that id does not exist' });
            return;
        }

        if (config.type !== type) {
            await res.status(404).send({ error: 'Config type does not match URL type' });
            return;
        }

        if (config.userId !== req.user.sub) {
            await res.status(403).send({ error: 'Config does not belong to authorized user' });
            return;
        }

        await req.services.scriptConfigDb.deleteById(config.id);
        await res.status(200).send();
    }
};