import { RouteOptions } from 'fastify';
import { DeviceDb } from '../../db/DeviceDb';
import { jwtAuthentication, awaitAll, RequestUser } from '../../services';

export const getDevices: RouteOptions = {
    method: 'GET',
    url: '/api/devices',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {

        const user = req.user as RequestUser;

        const db = new DeviceDb();
        const all = await awaitAll(db.byUserId(user.id));
        res.send(all);
    }
};