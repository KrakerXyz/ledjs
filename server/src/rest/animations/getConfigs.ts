import { RouteOptions } from 'fastify';
import { Animation, AnimationConfig, AnimationConfigSummary, AnimationVersion, Id } from '@krakerxyz/netled-core';
import { jwtAuthentication } from '../../services';

export const getConfigs: RouteOptions = {
    method: 'GET',
    url: '/api/animations/configs',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const db = req.services.animationConfigDb;
        const animationsDb = req.services.animationDb;
        const allAsync = db.byUserId(req.user.sub);

        const animationMap = new Map<`${Id}|${AnimationVersion}`, Promise<Animation | null>>();

        const all: AnimationConfig[] = [];
        for await (const c of allAsync) {
            all.push(c);
            const key: `${Id}|${AnimationVersion}` = `${c.animation.id}|${c.animation.version}`;
            if (animationMap.has(key)) { continue; }
            animationMap.set(key, animationsDb.byId(c.animation.id, c.animation.version));
        }

        const ret: AnimationConfigSummary[] = [];
        for (const c of all) {
            const animProm = animationMap.get(`${c.animation.id}|${c.animation.version}`);
            if (!animProm) {
                req.log.error('animProm should not have been null');
                continue;
            }
            const anim = await animProm;
            if (!anim) {
                req.log.warn('Animation %s referenced by config %s did not exist', c.animation.id, c.id);
                continue;
            }

            ret.push({
                id: c.id,
                name: c.name,
                userId: c.userId,
                description: c.description,
                animation: c.animation,
                animationName: anim.name,
            });
        }

        res.send(ret);
    }
};