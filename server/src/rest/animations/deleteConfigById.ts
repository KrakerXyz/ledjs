
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

export const deleteConfigById: RouteOptions = {
    method: 'DELETE',
    url: '/api/animations/configs/:configId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                configId: { type: 'string', format: 'uuid' }
            },
            required: ['configId']
        }
    },
    handler: async (req, res) => {
        const configId = (req.params as any)['configId'] as Id;

        const config = await req.services.animationConfigDb.byId(configId);
        if (!config) {
            await res.status(404).send({ error: 'A config with that id does not exist' });
            return;
        }

        if (config.userId !== req.user.sub) {
            await res.status(403).send({ error: 'Config does not belong to authorized user' });
            return;
        }

        await req.services.animationConfigDb.deleteById(config.id);

        await res.status(200).send();
    }
};