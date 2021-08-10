import { RouteOptions } from 'fastify';
import { AnimationNamedConfigPost, animationNamedConfigPostSchema } from 'netled';
import { jwtAuthentication } from '../../services';

export const postConfig: RouteOptions = {
    method: 'POST',
    url: '/api/animations/config',
    preValidation: [jwtAuthentication],
    schema: {
        body: animationNamedConfigPostSchema
    },
    handler: async (req, res) => {
        const post = req.body as AnimationNamedConfigPost;

        if (!post) {
            res.status(400).send({ error: 'Missing animationNamedConfigPost body' });
            return;
        }

        throw new Error('Not implemented');
    }
};