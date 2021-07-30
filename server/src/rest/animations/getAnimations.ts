import { RouteOptions } from 'fastify';
import { AnimationDb } from '../../db';
import { awaitAll } from '../../services';

export const getAnimations: RouteOptions = {
    method: 'GET',
    url: '/api/animations',
    handler: async (req, res) => {
        const db = new AnimationDb();
        const all = await awaitAll(db.all());
        res.send(all);
    }
};