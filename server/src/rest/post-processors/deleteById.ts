
import { RouteOptions } from 'fastify';
import { Id } from '@krakerxyz/netled-core';
import { jwtAuthentication } from '../../services';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';

type Params = { postProcessorId: Id };

export const deleteById: RouteOptions = {
    method: 'DELETE',
    url: '/api/post-processors/:postProcessorId',
    preValidation: [jwtAuthentication],
    schema: {
        params: jsonSchema<Params>()
    },
    handler: async (req, res) => {
        const params = req.params as Params;

        const db = req.services.postProcessorDb;
        const postProcessor = await db.byId(params.postProcessorId, 'draft');
        if (!postProcessor) {
            await res.status(404).send({ error: `A draft postProcessor ${params.postProcessorId} does not exist` });
            return;
        }

        if (postProcessor.author !== req.user.sub) {
            await res.status(403).send({ error: 'PostProcessor does not belong to authorized user' });
            return;
        }

        await db.deleteById(postProcessor.id, postProcessor.version);

        await res.status(200).send();
    }
};