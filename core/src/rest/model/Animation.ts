import { Id, ScriptVersion } from '..';


/** A animation script */
export interface Animation {
    readonly id: Id;
    name: string;
    description: string | null;
    /** Plain-old-javascript for the animation */
    readonly js: string;
    /** Typescript-based animation script */
    ts: string;
    readonly published: boolean;
    readonly version: ScriptVersion
    readonly created: number;
    readonly author: Id;
}

export type AnimationSummary = Omit<Animation, 'js' | 'ts'>;
export type AnimationPost = Omit<Animation, 'version' | 'created' | 'author' | 'published'| 'js'>;