import { RouteOptions } from 'fastify';
import { jwtAuthentication, awaitAll } from '../../services';

export const getDevices: RouteOptions = {
    method: 'GET',
    url: '/api/devices',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {

        const db = req.services.deviceDb;
        const all = await awaitAll(db.byUserId(req.user.sub));
        res.send(all);
    }
};