
import { AnimationMeta, AnimationNamedConfig, AnimationPost, Animation } from '.';
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

    /** Returns the script text of the given animation */
    public async script(animationId: string, version: number): Promise<string> {
        return this.restClient.get(`/api/animations/${animationId}/script`, { version });
    }

    /** Creates or updates a draft version of an animation script */
    public saveDraft(animation: AnimationPost): Promise<AnimationMeta> {
        return this.restClient.post('/api/animations', animation);
    }

    /** Saves/Updates a named animation config */
    public saveConfig(config: AnimationNamedConfig): Promise<AnimationNamedConfig> {
        return this.restClient.post('/api/animations/config', config);
    }

}

