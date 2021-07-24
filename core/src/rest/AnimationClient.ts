
import { RestClient } from './RestClient';

export class AnimationClient {

    constructor(private readonly restClient: RestClient) { }

    public all<T extends boolean>(withScript: T): Promise<T extends true ? Animation[] : AnimationMeta[]> {
        return this.restClient.get('api/animations', { withScript });
    }

    public post<AnimationMeta>(animation: AnimationPost): Promise<AnimationMeta> {
        return this.restClient.post('api/animations', animation);
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