import type { Id } from './model/Id.js';
import type { PostProcessor, PostProcessorSummary, PostProcessorPost } from './model/PostProcessor.js';
import type { ScriptVersion } from './model/ScriptVersion.js';
import type { RestClient } from './RestClient.js';

export class PostProcessorRestClient {

    constructor(private readonly restClient: RestClient) {
    }

    /** Returns a list of all published postProcessors. Optionally include unpublished versions of your own scripts. */
    public list<T extends boolean = false>(withScript?: T): Promise<T extends true ? PostProcessor[] : PostProcessorSummary[]> {
        return this.restClient.get('/api/post-processors', { withScript });
    }

    /** Returns the latest published version of the given postProcessor id. Optionally includes draft version of your own script */
    public latest(postProcessorId: Id, includeDraft?: boolean): Promise<PostProcessor> {
        return this.restClient.get(`/api/post-processors/${postProcessorId}`, { includeDraft });
    }

    /** Return specific postProcessor version */
    public byId(postProcessorId: Id, version: ScriptVersion): Promise<PostProcessor> {
        return this.restClient.get(`/api/post-processors/${postProcessorId}/${version}`);
    }

    /** Returns the script text of the given postProcessor */
    public async script(postProcessorId: Id, version: ScriptVersion): Promise<string> {
        return this.restClient.get(`/api/post-processors/${postProcessorId}/${version}/script`);
    }

    /** Creates or updates a draft version of an postProcessor script */
    public saveDraft(postProcessor: PostProcessorPost): Promise<PostProcessorSummary> {
        return this.restClient.post('/api/post-processors', postProcessor);
    }

    /** Deletes the draft (unpublished) version of the given postProcessorId */
    public deleteDraft(postProcessorId: Id): Promise<void> {
        return this.restClient.delete(`/api/post-processors/${postProcessorId}`);
    }

}

