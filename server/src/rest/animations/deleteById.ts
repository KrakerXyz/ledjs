
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

interface Params { animationId: Id }

export const deleteById: RouteOptions = {
    method: 'DELETE',
    url: '/api/animations/:animationId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            required: ['animationId'],
            properties: {
                animationId: { type: 'string', format: 'uuid' }
            }
        }
    },
    handler: async (req, res) => {
        const params = req.params as Params;

        const db = req.services.animationDb;
        const animation = await db.byId(params.animationId, 'draft');
        if (!animation) {
            await res.status(404).send({ error: `A draft animation ${params.animationId} does not exist` });
            return;
        }

        if (animation.author !== req.user.sub) {
            await res.status(403).send({ error: 'Animation does not belong to authorized user' });
            return;
        }

        const configs = req.services.animationConfigDb.byAnimationId(params.animationId, req.user.sub, animation.version);

        for await (const config of configs) {
            await req.services.animationConfigDb.deleteById(config.id);
        }

        await db.deleteById(animation.id, animation.version);

        await res.status(200).send();
    }
};