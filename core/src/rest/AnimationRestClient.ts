import type { AnimationSummary, Animation, AnimationPost } from './model/Animation.js';
import type { Id } from './model/Id.js';
import type { ScriptVersion } from './model/ScriptVersion.js';
import type { RestClient } from './RestClient.js';

export class AnimationRestClient {

    constructor(private readonly restClient: RestClient) {
    }

    /** Returns a list of all animations */
    public list<T extends boolean = false>(withScript?: T): Promise<T extends true ? Animation[] : AnimationSummary[]> {
        return this.restClient.get('/api/animations', { withScript });
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
}

