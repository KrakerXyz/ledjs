
import type { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';


export const getStrands: RouteOptions = {
    method: 'GET',
    url: '/api/strands',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const db = req.services.strandDb;
        const all = await awaitAll(db.all(req.user.userId));

        await res.send(all);
    }
};