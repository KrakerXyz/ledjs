import type { RouteOptions } from 'fastify';
import { buildScript } from '../../services/buildScript.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { AnimationPost, Animation } from '../../../../core/src/rest/model/Animation.js';
import { parseAst } from '../../../../core/src/services/parseAst.js';
import { validateScript } from '../../../../core/src/services/validateScript.js';

export const postAnimation: RouteOptions = {
    method: 'POST',
    url: '/api/animations',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const animationPost = req.body as AnimationPost;

        const db = req.services.animationDb;

        const ast = parseAst(animationPost.ts);
        
        const codeIssues = validateScript(ast);

        if (codeIssues.length) {
            await res.status(400).send({ error: `Script contains errors: ${JSON.stringify(codeIssues)}` });
            return;
        }

        const newJs = await buildScript(ast);
        if (!newJs) {
            await res.status(400).send({ error: 'JS tranpilation failed' });
            return;
        }

        const animation: Animation = {
            ...animationPost,
            js: newJs,
            published: false,
            version: 'draft',
            created: Date.now(),
            author: req.user.sub
        };

        const result = await db.upsert(animation);

        const { ts, js, ...animationMeta } = animation;

        await res.status(result.updated ? 200 : 201).send(animationMeta);

    }
};