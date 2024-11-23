import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

export const getConfigById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/configs/:configId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                configId: { type: 'string' }
            },
            required: ['configId']
        }
    },
    handler: async (req, res) => {
        const configId: Id = (req.params as any).configId;
        const db = req.services.animationConfigDb;
        const config = await db.byId(configId);

        if (!config) {
            await res.status(404).send({ error: 'A config with that id does not exist' });
            return;
        }

        if (config.userId !== req.user.sub) {
            await res.status(403).send({ error: 'User does not have access to this config' });
            return;
        }

        await res.send(config);
    }
};