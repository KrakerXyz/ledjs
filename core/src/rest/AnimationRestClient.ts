
import type { AnimationSummary, AnimationConfig, AnimationPost, Animation, Id, AnimationConfigSummary, AnimationConfigPost, ScriptVersion } from '.';
import type { RestClient } from './RestClient';

export class AnimationRestClient {

    constructor(private readonly restClient: RestClient) { }

    /** Returns a list of all animations */
    public list(): Promise<AnimationSummary[]> {
        return this.restClient.get('/api/animations');
    }

    /** Returns the latest published version of the given animation id. Optionally includes draft version of your own script */
    public latest(animationId: Id, includeDraft?: boolean): Promise<Animation> {
        return this.restClient.get(`/api/animations/${animationId}`, { includeDraft });
    }

    /** Return specific animation version */
    public byId(animationId: Id, version: ScriptVersion): Promise<Animation> {
        return this.restClient.get(`/api/animations/${animationId}/${version}`);
    }

    /** Returns the script text of the given animation */
    public async script(animationId: Id, version: ScriptVersion): Promise<string> {
        return this.restClient.get(`/api/animations/${animationId}/${version}/script`);
    }

    /** Creates or updates a draft version of an animation script */
    public saveDraft(animation: AnimationPost): Promise<AnimationSummary> {
        return this.restClient.post('/api/animations', animation);
    }

    /** Deletes the draft (unpublished) version of the given animationId */
    public deleteDraft(animationId: Id): Promise<void> {
        return this.restClient.delete(`/api/animations/${animationId}`);
    }

    /** Gets a list of all configs for the users. Does not return the configuration detail. */
    private configList(): Promise<AnimationConfigSummary[]>
    /** Get all configs for all versions of a an animation */
    private configList(animationId: Id): Promise<AnimationConfig[]>
    /** Get all configs for a specific animation.version */
    private configList(animationId: Id, version: ScriptVersion): Promise<AnimationConfig[]>
    private configList(animationId?: Id, version?: ScriptVersion): Promise<AnimationConfig[]> | Promise<AnimationConfigSummary[]> {
        if (animationId) {
            return this.restClient.get<AnimationConfig[]>(`/api/animations/${animationId}/configs`, { version });
        } else {
            return this.restClient.get<AnimationConfigSummary[]>('/api/animations/configs');
        }
    }

    public readonly config = {
        /** Get a list of configs for this animation */
        list: this.configList.bind(this),
        byId: (configId: Id): Promise<AnimationConfig> => {
            return this.restClient.get(`/api/animations/configs/${configId}`);
        },
        /** Saves/Updates a named animation config */
        save: (config: AnimationConfigPost): Promise<AnimationConfig> => {
            return this.restClient.post('/api/animations/configs', config);
        },
        /** Delete a config by it's id */
        delete: (configId: Id): Promise<void> => {
            return this.restClient.delete(`/api/animations/configs/${configId}`);
        }
    };


}

