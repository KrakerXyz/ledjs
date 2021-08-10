import { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services';

export const getConfigById: RouteOptions = {
    method: 'GET',
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
        const configId: string = (req.params as any).configId;
        const db = req.services.animationConfigDb;
        const config = await db.byId(configId);

        if (!config) {
            res.status(404).send({ error: 'A config with that id does not exist' });
            return;
        }

        if (config.userId !== req.user.sub) {
            res.status(403).send({ error: 'User does not have access to this config' });
            return;
        }

        res.send(config);
    }
};