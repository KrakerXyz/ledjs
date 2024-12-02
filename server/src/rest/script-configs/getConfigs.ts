
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Animation } from '../../../../core/src/rest/model/Animation.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';
import type { ScriptVersion } from '../../../../core/src/rest/model/ScriptVersion.js';
import { ScriptConfig, ScriptConfigSummary, ScriptType } from '../../../../core/src/rest/model/ScriptConfig.js';

export const getConfigs: RouteOptions = {
    method: 'GET',
    url: '/api/configs/:type',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['animation', 'post-processor'] }
            },
            required: ['type']
        }
    },
    handler: async (req, res) => {
        const type = (req.params as any).type as ScriptType;
        const db = req.services.scriptConfigDb;
        const scriptDb = type === 'animation' ? req.services.animationDb : req.services.postProcessorDb;
        const allAsync = db.byUserId(type, req.user.sub);

        const scriptMap = new Map<`${Id}|${ScriptVersion}`, Promise<Animation | null>>();
        const all: ScriptConfig[] = [];
        
        for await (const c of allAsync) {
            all.push(c);
            const key: `${Id}|${ScriptVersion}` = `${c.script.id}|${c.script.version}`;
            if (scriptMap.has(key)) { continue; }
            scriptMap.set(key, scriptDb.byId(c.script.id, c.script.version));
        }

        const ret: ScriptConfigSummary[] = [];
        for (const c of all) {
            const scriptProm = scriptMap.get(`${c.script.id}|${c.script.version}`);
            if (!scriptProm) {
                req.log.error('scriptProm should not have been null');
                continue;
            }
            const script = await scriptProm;
            if (!script) {
                req.log.warn('Script %s referenced by config %s did not exist', c.script.id, c.id);
                continue;
            }

            ret.push({
                id: c.id,
                type: c.type,
                name: c.name,
                userId: c.userId,
                description: c.description,
                script: c.script,
                scriptName: script.name,
            });
        }

        res.send(ret);
    }
};