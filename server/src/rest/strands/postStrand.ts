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
            author: req.user.userId
        };

        const result = await db.upsert(strand);

        if (result.updated) {
            req.services.mqtt.publishStrandAction(strand.id, 'updated');
        }

        await res.status(result.updated ? 200 : 201).send(strand);

    }
};