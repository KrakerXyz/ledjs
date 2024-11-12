
import type { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';


export const getStrands: RouteOptions = {
    method: 'GET',
    url: '/api/strands',
    handler: async (req, res) => {
        const db = req.services.strandDb;
        const all = await awaitAll(db.all());

        await res.send(all);
    }
};