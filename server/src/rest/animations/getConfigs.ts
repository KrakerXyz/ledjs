import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Animation } from '../../../../core/src/rest/model/Animation.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';
import type { ScriptVersion } from '../../../../core/src/rest/model/ScriptVersion.js';
import { ScriptConfig, ScriptConfigSummary } from '../../../../core/src/rest/model/ScriptConfig.js';

export const getConfigs: RouteOptions = {
    method: 'GET',
    url: '/api/animations/configs',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const db = req.services.scriptConfigDb;
        const animationsDb = req.services.animationDb;
        const allAsync = db.byUserId('animation', req.user.sub);

        const animationMap = new Map<`${Id}|${ScriptVersion}`, Promise<Animation | null>>();

        const all: ScriptConfig[] = [];
        for await (const c of allAsync) {
            all.push(c);
            const key: `${Id}|${ScriptVersion}` = `${c.script.id}|${c.script.version}`;
            if (animationMap.has(key)) { continue; }
            animationMap.set(key, animationsDb.byId(c.script.id, c.script.version));
        }

        const ret: ScriptConfigSummary[] = [];
        for (const c of all) {
            const animProm = animationMap.get(`${c.script.id}|${c.script.version}`);
            if (!animProm) {
                req.log.error('animProm should not have been null');
                continue;
            }
            const anim = await animProm;
            if (!anim) {
                req.log.warn('Animation %s referenced by config %s did not exist', c.script.id, c.id);
                continue;
            }

            ret.push({
                id: c.id,
                type: c.type,
                name: c.name,
                userId: c.userId,
                description: c.description,
                script: c.script,
                scriptName: anim.name,
            });
        }

        res.send(ret);
    }
};