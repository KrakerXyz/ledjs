import type { preValidationHookHandler } from 'fastify';
import type { Id } from '../../../core/src/rest/model/Id.js';

export const deviceAuthentication: preValidationHookHandler = async (req, res) => {
    const authParts = req.headers?.authorization?.split(' ');

    if (!authParts) {
        throw new Error('Missing authorization header');
    }

    if (authParts.length !== 2) {
        throw new Error('Malformed authorization header');

    } else if (authParts[0].toLowerCase() !== 'device') {
        throw new Error('Invalid scheme');
    }

    const tokenValue = Buffer.from(authParts[1], 'base64').toString();
    const tokenParts = tokenValue.split(':');
    if (tokenParts.length !== 2) {
        throw new Error('Malformed token value');
    }

    const deviceDb = req.services.deviceDb;
    const device = await deviceDb.byId(tokenParts[0] as Id);
    if (device?.secret !== tokenParts[1]) {
        res.status(401).send('Invalid token');
        throw new Error('Invalid token');
    }

    req.user = {
        sub: device.id
    };
};