
import type { Id } from './model/Id.js';
import type { ScriptVersion } from './model/ScriptVersion.js';
import type { ScriptConfig, ScriptConfigSummary, ScriptConfigPost, ScriptType } from './model/ScriptConfig.js';
import type { RestClient } from './RestClient.js';

export class ScriptConfigRestClient {
    constructor(
        private readonly restClient: RestClient
    ) {}

    public list(type: ScriptType): Promise<ScriptConfigSummary[]>;
    public list(type: ScriptType, scriptId: Id): Promise<ScriptConfigSummary[]>;
    public list(type: ScriptType, scriptId: Id, version: ScriptVersion): Promise<ScriptConfigSummary[]>;
    public list(type: ScriptType, scriptId?: Id, version?: ScriptVersion): Promise<ScriptConfigSummary[]> {

        const urlParams = new URLSearchParams();
        urlParams.append('type', type);
        if (scriptId) {
            urlParams.append('scriptId', scriptId);
        }
        if (version) {
            urlParams.append('version', version.toString());
        }

        return this.restClient.get(`/api/configs`, urlParams);
    }

    public byId(configId: Id): Promise<ScriptConfig> {
        return this.restClient.get(`/api/configs/${configId}`);
    }

    public save(config: ScriptConfigPost): Promise<ScriptConfig> {
        return this.restClient.post('/api/configs', config);
    }

    public delete(configId: Id): Promise<void> {
        return this.restClient.delete(`/api/configs/${configId}`);
    }
}