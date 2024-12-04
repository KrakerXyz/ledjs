
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Animation } from '../../../../core/src/rest/model/Animation.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';
import type { ScriptVersion } from '../../../../core/src/rest/model/ScriptVersion.js';
import { ScriptConfig, ScriptConfigSummary, ScriptType } from '../../../../core/src/rest/model/ScriptConfig.js';

export const getConfigs: RouteOptions = {
    method: 'GET',
    url: '/api/configs',
    preValidation: [jwtAuthentication],
    schema: {
        querystring: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['animation', 'post-processor'] },
                scriptId: { type: 'string' },
                version: { "anyOf": [
                    {
                        type: "number"
                    },
                    {
                        type: "string",
                        const: "draft"
                    }
                ]}
            },
            required: ['type']
        }
    },
    handler: async (req, res) => {
        const type = (req.query as any).type as ScriptType;
        const scriptId = (req.query as any).scriptId as Id | undefined;
        const version = (req.query as any).version as ScriptVersion | undefined;
        const db = req.services.scriptConfigDb;
        const scriptDb = type === 'animation' ? req.services.animationDb : req.services.postProcessorDb;
        const allAsync = db.byUserId(type, req.user.sub);

        const scriptMap = new Map<`${Id}|${ScriptVersion}`, Promise<Animation | null>>();
        const all: ScriptConfig[] = [];
        
        for await (const c of allAsync) {

            if (scriptId && c.script.id !== scriptId) { continue; }
            if (version && c.script.version !== version) { continue; }

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
                config: c.config
            });
        }

        res.send(ret);
    }
};