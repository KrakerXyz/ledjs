import { RouteOptions } from 'fastify';
import { DeviceAnimationConfigPost } from 'netled';
import { jwtAuthentication } from '../../services';

export const postAnimationConfig: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation-config',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const post = req.body as DeviceAnimationConfigPost;

        if (!post) {
            res.status(400).send({ error: 'Missing deviceAnimationConfigPost body' });
            return;
        }

        throw new Error('Not implemented');
    }
};