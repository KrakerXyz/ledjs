import { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';

export const getDevices: RouteOptions = {
    method: 'GET',
    url: '/api/devices',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const db = req.services.deviceDb;
        const all = await awaitAll(db.byUserId(req.user.sub));
        await res.send(all);
    }
};