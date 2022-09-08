import { Id } from '..';

export interface Animation {
    readonly id: Id;
    name: string;
    description?: string | null;
    /** Plain-old-javascript for the animation */
    readonly js: string;
    /** Typescript-based animation script */
    ts: string;
    readonly published: boolean;
    readonly version: number;
    readonly created: number;
    readonly author: Id;
    readonly $v: 2;
}

export type AnimationMeta = Omit<Animation, 'script' | 'js' | 'ts'>;
export type AnimationPost = Omit<Animation, 'version' | 'created' | 'author' | 'published'| 'js'>;