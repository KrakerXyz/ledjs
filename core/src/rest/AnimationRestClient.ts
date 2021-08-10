
import { AnimationMeta, AnimationNamedConfig, AnimationPost, Animation } from '.';
import { AnimationNamedConfigPost } from './model';
import { RestClient } from './RestClient';

export class AnimationRestClient {

    constructor(private readonly restClient: RestClient) { }

    /** Returns a list of all published animations. Optionally include unpublished versions of your own scripts. */
    public list<T extends boolean = false>(withScript?: T): Promise<T extends true ? Animation[] : AnimationMeta[]> {
        return this.restClient.get('/api/animations', { withScript });
    }

    /** Returns the latest published version of the given animation id. Optionally includes draft version of your own script */
    public latest(animationId: string, includeDraft?: boolean): Promise<Animation> {
        return this.restClient.get(`/api/animations/${animationId}`, { includeDraft });
    }

    /** Return specific animation version */
    public byId(animationId: string, version: number): Promise<Animation> {
        return this.restClient.get(`/api/animations/${animationId}/${version}`);
    }

    /** Returns the script text of the given animation */
    public async script(animationId: string, version: number): Promise<string> {
        return this.restClient.get(`/api/animations/${animationId}/${version}/script`);
    }

    /** Creates or updates a draft version of an animation script */
    public saveDraft(animation: AnimationPost): Promise<AnimationMeta> {
        return this.restClient.post('/api/animations', animation);
    }

    /** Get a list of configs for this animation */
    public configList(animationId: string, version?: number): Promise<AnimationNamedConfig[]> {
        return this.restClient.get(`/api/animations/${animationId}/configs`, { version });
    }

    public configById(configId: string): Promise<AnimationNamedConfig> {
        return this.restClient.get(`/api/animations/configs/${configId}`);
    }

    /** Saves/Updates a named animation config */
    public saveConfig(config: AnimationNamedConfigPost): Promise<AnimationNamedConfig> {
        return this.restClient.post('/api/animations/configs', config);
    }

}

