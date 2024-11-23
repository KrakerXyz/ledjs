import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { StrandPost, Strand } from '../../../../core/src/rest/model/Strand.js';
import { jsonSchemas } from '../../db/schema/schemaUtility.js';

export const postStrand: RouteOptions = {
    method: 'POST',
    url: '/api/strands',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchemas.strandPost
    },
    handler: async (req, res) => {
        const strandPost = req.body as StrandPost;

        const db = req.services.strandDb;

        const strand: Strand = {
            ...strandPost,
            created: Date.now(),
            author: req.user.sub
        };

        const result = await db.upsert(strand);


        await res.status(result.updated ? 200 : 201).send(strand);

    }
};