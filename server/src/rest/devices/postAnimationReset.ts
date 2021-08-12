import { RouteOptions } from 'fastify';
import { DeviceAnimationResetPost } from 'netled';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { jwtAuthentication } from '../../services';

export const postAnimationReset: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation/reset',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<DeviceAnimationResetPost>()
    },
    handler: async (req, res) => {

        const post = req.body as DeviceAnimationResetPost;

        res.status(500).send({ error: 'not implemented' });

    }
};