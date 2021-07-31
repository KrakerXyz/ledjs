import { preValidationHookHandler } from 'fastify';

export const jwtAuthentication: preValidationHookHandler = async (req, res) => {
    try {
        await req.jwtVerify();
    } catch (err) {
        res.send(err);
    }
};