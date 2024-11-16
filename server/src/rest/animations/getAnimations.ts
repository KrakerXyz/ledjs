
import type { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';

export const getAnimations: RouteOptions = {
    method: 'GET',
    url: '/api/animations',
    handler: async (req, res) => {
        const withScript = (req.query as any).withScript === 'true';
        const db = req.services.animationDb;
        const all = await awaitAll(db.all(withScript));

        await res.send(all);
    }
};