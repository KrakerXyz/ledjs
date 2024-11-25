import type { preValidationHookHandler } from 'fastify';
import { deviceAuthentication } from './deviceAuthentication.js';

export const jwtAuthentication: preValidationHookHandler = (req, res, done) => {
    if (req.headers?.authorization?.startsWith('device')) {
        (deviceAuthentication as any)(req, res).then(() => done()).catch(done);
        return;
    };
    
    req.jwtVerify().then(() => {
        req.user.authType = 'jwt';
        req.user.userId = req.user.sub;
        done();
    }).catch(done);
};