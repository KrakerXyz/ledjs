import { RouteOptions } from 'fastify';

export const getLatestById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId',
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
        const animationId = (req.params as any)['animationId'];
        const db = req.services.animationDb;
        const animation = await db.latestById(animationId, (req.query as any)['includeDraft'] === 'true');
        if (!animation) {
            await res.status(404).send({ error: 'An animation with that id does not exist' });
            return;
        }

        await res.status(200).send(animation);
    }
};