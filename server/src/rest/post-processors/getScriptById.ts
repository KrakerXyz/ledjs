import type { RouteOptions } from 'fastify';
import type { ScriptVersion } from '../../../../core/src/rest/model/ScriptVersion.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

interface Params { postProcessorId: Id, version: ScriptVersion }

export const getScriptById: RouteOptions = {
    method: 'GET',
    url: '/api/post-processors/:postProcessorId/:version/script',
    schema: {
        params: {
            type: 'object',
            properties: {
                postProcessorId: { type: 'string', format: 'uuid' },
                version: { type: ['integer', 'string'] }
            },
            required: ['postProcessorId', 'version']
        }
    },
    handler: async (req, res) => {
        const params = req.params as Params;

        const db = req.services.postProcessorDb;
        const postProcessor = await db.byId(params.postProcessorId, params.version);

        if (!postProcessor) {
            await res.status(404).send({ error: 'An postProcessor with that id/version does not exist' });
            return;
        }

        await res.status(200).header('Content-Type', 'text/javascript').send(postProcessor.js);
    }
};