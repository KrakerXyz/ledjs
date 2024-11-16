
import type { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';


export const getPostProcessors: RouteOptions = {
    method: 'GET',
    url: '/api/post-processors',
    handler: async (req, res) => {
        const withScript = (req.query as any).withScript === 'true';
        const db = req.services.postProcessorDb;
        const all = await awaitAll(db.all(withScript));

        await res.send(all);
    }
};