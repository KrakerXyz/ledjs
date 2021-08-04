import { preValidationHookHandler } from 'fastify';
import { DeviceDb } from '../db/DeviceDb';

export const deviceAuthentication: preValidationHookHandler = async (req, res) => {
    const authParts = req.headers?.authorization?.split(' ');

    try {

        if (!authParts) {
            throw new Error('Missing authorization header');
        }

        if (authParts.length !== 2) {
            throw new Error('Malformed authorization header');

        } else if (authParts[0].toLowerCase() !== 'basic') {
            throw new Error('Invalid scheme');
        }

        const tokenValue = Buffer.from(authParts[1], 'base64').toString();
        const tokenParts = tokenValue.split(':');
        if (tokenParts.length !== 2) {
            throw new Error('Malformed token value');
        }

        const deviceDb = new DeviceDb();
        const device = await deviceDb.byId(tokenParts[0]);
        if (device?.secret !== tokenParts[1]) {
            throw new Error('Invalid token');
        }

        req.user = {
            sub: device.id
        };

    } catch (e) {
        res.send(e);
    }

};