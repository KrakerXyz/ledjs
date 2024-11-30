
import type { Id } from './model/Id.js';
import type { ScriptVersion } from './model/ScriptVersion.js';
import type { ScriptConfig, ScriptConfigSummary, ScriptConfigPost, ScriptType } from './model/ScriptConfig.js';
import type { RestClient } from './RestClient.js';

export class ScriptConfigRestClient {
    constructor(
        private readonly restClient: RestClient
    ) {}

    public list(type: ScriptType): Promise<ScriptConfigSummary[]>;
    public list(type: ScriptType, scriptId: Id): Promise<ScriptConfig[]>;
    public list(type: ScriptType, scriptId: Id, version: ScriptVersion): Promise<ScriptConfig[]>;
    public list(type: ScriptType, scriptId?: Id, version?: ScriptVersion): Promise<ScriptConfig[] | ScriptConfigSummary[]> {
        if (scriptId) {
            return this.restClient.get(`/api/configs/${type}/${scriptId}`, { version });
        }
        return this.restClient.get(`/api/configs/${type}`);
    }

    public byId(type: ScriptType, configId: Id): Promise<ScriptConfig> {
        return this.restClient.get(`/api/configs/${type}/${configId}`);
    }

    public save(config: ScriptConfigPost): Promise<ScriptConfig> {
        return this.restClient.post(`/api/configs/${config.type}`, config);
    }

    public delete(type: ScriptType, configId: Id): Promise<void> {
        return this.restClient.delete(`/api/configs/${type}/${configId}`);
    }
}