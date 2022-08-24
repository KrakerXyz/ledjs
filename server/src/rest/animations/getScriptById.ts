import { RouteOptions } from 'fastify';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { Id } from '@krakerxyz/netled-core';

export const getScriptById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/:version/script',
    schema: {
        params: jsonSchema<{ animationId: Id, version: number }>()
    },
    handler: async (req, res) => {
        const animationId = (req.params as any)['animationId'] as Id;
        const version = (req.params as any)['version'] as number;

        const db = req.services.animationDb;
        const animation = await db.byId(animationId, version);

        if (!animation) {
            await res.status(404).send({ error: 'An animation with that id/version does not exist' });
            return;
        }

        await res.status(200).header('Content-Type', 'text/javascript').send(animation.script);
    }
};