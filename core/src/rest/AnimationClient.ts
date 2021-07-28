
import { AnimatorType, ConfigMeta } from '../animation';
import { RestClient } from './RestClient';

export class AnimationClient {

    constructor(private readonly restClient: RestClient) { }

    public all<T extends boolean>(withScript?: T): Promise<T extends true ? Animation[] : AnimationMeta[]> {
        return this.restClient.get('/api/animations', { withScript });
    }

    public latestById(animationId: string, includeDraft?: boolean): Promise<Animation> {
        return this.restClient.get(`/api/animations/${animationId}`, { includeDraft });
    }

    public async importScriptById<TMeta extends ConfigMeta = any>(animationId: string, version: number): Promise<AnimatorType<TMeta>> {
        const module = await import(`${this.restClient.origin}/api/animations/${animationId}/script?version=${version}`);
        return module.default;
    }

    public post<AnimationMeta>(animation: AnimationPost): Promise<AnimationMeta> {
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