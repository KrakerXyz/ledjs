import { RouteOptions } from 'fastify';
import { DeviceAnimationResetPost } from 'netled';

export const postAnimationReset: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation/reset',
    handler: async (req, res) => {

        const post = req.body as DeviceAnimationResetPost;

        res.status(500).send({ error: 'not implemented' });

    }
};