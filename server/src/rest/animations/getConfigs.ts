import { RouteOptions } from 'fastify';
import { awaitAll, jwtAuthentication } from '../../services';

export const getConfigs: RouteOptions = {
    method: 'GET',
    url: '/api/animations/:animationId/configs',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const animationId: string = (req.params as any).animationId;
        const version: number | undefined = (req.query as any).version;
        if (!animationId) {
            res.status(400).send({ error: 'Missing animationId parameter' });
            return;
        }
        const db = req.services.animationConfigDb;
        const allAsync = db.byAnimationId(animationId, req.user.sub, version);
        const all = await awaitAll(allAsync);
        res.send(all);
    }
};