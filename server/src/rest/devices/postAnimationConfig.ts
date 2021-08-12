import { RouteOptions } from 'fastify';
import { DeviceAnimationConfigPost } from 'netled';
import { jwtAuthentication } from '../../services';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';

export const postAnimationConfig: RouteOptions = {
    method: 'POST',
    url: '/api/devices/animation-config',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<DeviceAnimationConfigPost>()
    },
    handler: async (req, res) => {
        const post = req.body as DeviceAnimationConfigPost;
        throw new Error('Not implemented');
    }
};