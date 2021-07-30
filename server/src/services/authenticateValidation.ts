import { preValidationHookHandler } from 'fastify';

export const authenticateValidation: preValidationHookHandler = async (req, res) => {
    try {
        await req.jwtVerify();
    } catch (err) {
        res.send(err);
    }
};