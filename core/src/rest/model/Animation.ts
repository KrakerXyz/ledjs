import { Id } from '..';

export interface Animation {
    readonly id: Id;
    name: string;
    description?: string | null;
    script: string;
    readonly published: boolean;
    readonly version: number;
    readonly created: number;
    readonly author: Id;
}

export type AnimationMeta = Omit<Animation, 'script'>;

export type AnimationPost = Omit<Animation, 'version' | 'created' | 'author' | 'published'>;