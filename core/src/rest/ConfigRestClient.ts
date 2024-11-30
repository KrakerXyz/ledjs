
import type { Id } from './model/Id.js';
import type { ScriptVersion } from './model/ScriptVersion.js';
import type { RestClient } from './RestClient.js';

export class ConfigRestClient<TConfig, TConfigSummary, TConfigPost> {
    constructor(
        private readonly restClient: RestClient,
        private readonly basePath: string
    ) { }

    /** Get all configs for all versions of a script */
    public list(): Promise<TConfigSummary[]>;
    public list(scriptId: Id): Promise<TConfig[]>;
    public list(scriptId: Id, version: ScriptVersion): Promise<TConfig[]>;
    public list(scriptId?: Id, version?: ScriptVersion): Promise<TConfig[] | TConfigSummary[]> {
        if (scriptId) {
            return this.restClient.get<TConfig[]>(`${this.basePath}/${scriptId}/configs`, { version });
        } else {
            return this.restClient.get<TConfigSummary[]>(`${this.basePath}/configs`);
        }
    }

    public byId(configId: Id): Promise<TConfig> {
        return this.restClient.get(`${this.basePath}/configs/${configId}`);
    }

    public save(config: TConfigPost): Promise<TConfig> {
        return this.restClient.post(`${this.basePath}/configs`, config);
    }

    public delete(configId: Id): Promise<void> {
        return this.restClient.delete(`${this.basePath}/configs/${configId}`);
    }
}