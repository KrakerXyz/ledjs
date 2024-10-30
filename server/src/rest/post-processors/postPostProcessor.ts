import type { RouteOptions } from 'fastify';
import { buildScript } from '../../services/buildScript.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { PostProcessorPost, PostProcessor } from '../../../../core/src/rest/model/PostProcessor.js';
import { parseAst } from '../../../../core/src/services/parseAst.js';

export const postPostProcessor: RouteOptions = {
    method: 'POST',
    url: '/api/post-processors',
    preValidation: [jwtAuthentication],
    
    handler: async (req, res) => {
        const postProcessorPost = req.body as PostProcessorPost;

        const db = req.services.postProcessorDb;

        const ast = parseAst(postProcessorPost.ts);
        //const codeIssues = validateScript(ast);

        // if (codeIssues.length) {
        //     await res.status(400).send({ error: `Script contains errors: ${JSON.stringify(codeIssues)}` });
        //     return;
        // }

        const newJs = await buildScript(ast);
        if (!newJs) {
            await res.status(400).send({ error: 'JS tranpilation failed' });
            return;
        }

        const postProcessor: PostProcessor = {
            ...postProcessorPost,
            js: newJs,
            published: false,
            version: 'draft',
            created: Date.now(),
            author: req.user.sub
        };

        const result = await db.upsert(postProcessor);

        const { ts, js, ...postProcessorMeta } = postProcessor;

        await res.status(result.updated ? 200 : 201).send(postProcessorMeta);

    }
};