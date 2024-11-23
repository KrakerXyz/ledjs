import type { RouteOptions } from 'fastify';
import type { ScriptVersion } from '../../../../core/src/rest/model/ScriptVersion.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

interface Params { animationId: Id, version: ScriptVersion }

export const getScriptById: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/:version/script',
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