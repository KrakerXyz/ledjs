
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { ScriptConfigPost, ScriptConfig } from '../../../../core/src/rest/model/ScriptConfig.js';

export const postConfig: RouteOptions = {
    method: 'POST',
    url: '/api/configs',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const post = req.body as ScriptConfigPost;

        const db = req.services.scriptConfigDb;
        const existing = await db.byId(post.id);

        if (existing && existing.userId !== req.user.sub) {
            await res.status(401).send({ error: 'Config does not belong to you' });
            return;
        }

        if (post.type === 'animation' && !(await req.services.animationDb.byId(post.script.id, post.script.version))) {
            await res.status(400).send({ error: 'Animation does not exist not exist' });
            return;   
        } else if (post.type === 'post-processor' && !(await req.services.postProcessorDb.byId(post.script.id, post.script.version))) {
            await res.status(400).send({ error: 'Post-processor does not exist not exist' });
            return;   
        }

        const newConfig: ScriptConfig = {
            ...post,
            userId: req.user.sub,
        };

        const result = await db.upsert(newConfig);

        if (result.updated) {
            req.services.mqtt.publish(`script-config/${post.id}/updated`);
        }
        
        await res.status(existing ? 200 : 201).send(newConfig);
    }
};