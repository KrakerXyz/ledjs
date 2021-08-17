import { RouteOptions } from 'fastify';
import { awaitAll } from '../../services';

export const getAnimations: RouteOptions = {
    method: 'GET',
    url: '/api/animations',
    handler: async (req, res) => {
        const db = req.services.animationDb;
        const all = await awaitAll(db.all());
        res.send(all);
    }
};