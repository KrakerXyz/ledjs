import { RouteOptions } from 'fastify';
import { DeviceDb } from '../../db/DeviceDb';
import { jwtAuthentication, awaitAll } from '../../services';

export const getDevices: RouteOptions = {
    method: 'GET',
    url: '/api/devices',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {

        const db = new DeviceDb();
        const all = await awaitAll(db.byUserId(req.user.sub));
        res.send(all);
    }
};