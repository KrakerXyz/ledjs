
import { RestClient } from './RestClient';

export class AnimationRestClient {

    constructor(private readonly restClient: RestClient) { }

    public list<T extends boolean = false>(withScript?: T): Promise<T extends true ? Animation[] : AnimationMeta[]> {
        return this.restClient.get('/api/animations', { withScript });
    }

    public latest(animationId: string, includeDraft?: boolean): Promise<Animation> {
        return this.restClient.get(`/api/animations/${animationId}`, { includeDraft });
    }

    public async script(animationId: string, version: number): Promise<string> {
        return this.restClient.get(`/api/animations/${animationId}/script`, { version });
    }

    public saveDraft<AnimationMeta>(animation: AnimationPost): Promise<AnimationMeta> {
        return this.restClient.post('/api/animations', animation);
    }

}

export interface Animation {
    readonly id: string;
    name: string;
    description?: string | null;
    script: string;
    readonly published: boolean;
    readonly version: number;
    readonly created: number;
    readonly author: string;
}

export type AnimationMeta = Omit<Animation, 'script'>;

export type AnimationPost = Omit<Animation, 'version' | 'created' | 'author' | 'published'>;