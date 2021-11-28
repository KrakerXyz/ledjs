
import { AnimationMeta, AnimationNamedConfig, AnimationPost, Animation, Id } from '.';
import { AnimationNamedConfigPost, AnimationNamedConfigSummary } from './model';
import { RestClient } from './RestClient';

export class AnimationRestClient {

    constructor(private readonly restClient: RestClient) { }

    /** Returns a list of all published animations. Optionally include unpublished versions of your own scripts. */
    public list<T extends boolean = false>(withScript?: T): Promise<T extends true ? Animation[] : AnimationMeta[]> {
        return this.restClient.get('/api/animations', { withScript });
    }

    /** Returns the latest published version of the given animation id. Optionally includes draft version of your own script */
    public latest(animationId: Id, includeDraft?: boolean): Promise<Animation> {
        return this.restClient.get(`/api/animations/${animationId}`, { includeDraft });
    }

    /** Return specific animation version */
    public byId(animationId: Id, version: number): Promise<Animation> {
        return this.restClient.get(`/api/animations/${animationId}/${version}`);
    }

    /** Returns the script text of the given animation */
    public async script(animationId: Id, version: number): Promise<string> {
        return this.restClient.get(`/api/animations/${animationId}/${version}/script`);
    }

    /** Creates or updates a draft version of an animation script */
    public saveDraft(animation: AnimationPost): Promise<AnimationMeta> {
        return this.restClient.post('/api/animations', animation);
    }

    /** Deletes the draft (unpublished) version of the given animationId */
    public deleteDraft(animationId: Id): Promise<void> {
        return this.restClient.delete(`/api/animations/${animationId}`);
    }

    /** Gets a list of all configs for the users. Does not return the configuration detail. */
    private configList(): Promise<AnimationNamedConfigSummary[]>
    /** Get all configs for all versions of a an animation */
    private configList(animationId: Id): Promise<AnimationNamedConfig[]>
    /** Get all configs for a specific animation.version */
    private configList(animationId: Id, version: number): Promise<AnimationNamedConfig[]>
    private configList(animationId?: Id, version?: number): Promise<AnimationNamedConfig[]> | Promise<AnimationNamedConfigSummary[]> {
        if (animationId) {
            return this.restClient.get<AnimationNamedConfig[]>(`/api/animations/${animationId}/configs`, { version });
        } else {
            return this.restClient.get<AnimationNamedConfigSummary[]>('/api/animations/configs');
        }
    }

    public readonly config = {
        /** Get a list of configs for this animation */
        list: this.configList.bind(this),
        byId: (configId: Id): Promise<AnimationNamedConfig> => {
            return this.restClient.get(`/api/animations/configs/${configId}`);
        },
        /** Saves/Updates a named animation config */
        save: (config: AnimationNamedConfigPost): Promise<AnimationNamedConfig> => {
            return this.restClient.post('/api/animations/configs', config);
        },
        /** Delete a config by it's id */
        delete: (configId: Id): Promise<void> => {
            return this.restClient.delete(`/api/animations/configs/${configId}`);
        }
    };


}

