import { RouteOptions } from 'fastify';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { AnimationVersion, Id } from '@krakerxyz/netled-core';

type Params = { animationId: Id, version: AnimationVersion };

export const getScriptById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/:version/script',
    schema: {
        params: jsonSchema<Params>()
    },
    handler: async (req, res) => {
        const params = req.params as Params;

        const db = req.services.animationDb;
        const animation = await db.byId(params.animationId, params.version);

        if (!animation) {
            await res.status(404).send({ error: 'An animation with that id/version does not exist' });
            return;
        }

        await res.status(200).header('Content-Type', 'text/javascript').send(animation.js);
    }
};