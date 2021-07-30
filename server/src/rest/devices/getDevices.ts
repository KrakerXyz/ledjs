import { RouteOptions } from 'fastify';

export const getDevices: RouteOptions = {
    method: 'GET',
    url: '/api/devices',
    handler: (req, res) => {
        res.send(req.body);
    }
};