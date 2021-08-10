import { RouteOptions } from 'fastify';

export const getScriptById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/:version/script',
    schema: {
        params: {
            type: 'object',
            properties: {
                animationId: { type: 'string', format: 'uuid' },
                version: { type: 'number' }
            },
            required: ['animationId', 'version']
        }
    },
    handler: async (req, res) => {
        const animationId = (req.params as any)['animationId'] as string;
        const version = (req.params as any)['animationId'] as number;

        const db = req.services.animationDb;
        const animation = await db.byId(animationId, version);

        if (!animation) {
            res.status(404).send({ error: 'An animation with that id/version does not exist' });
            return;
        }

        res.status(200).header('Content-Type', 'text/javascript').send(animation.script);
    }
};