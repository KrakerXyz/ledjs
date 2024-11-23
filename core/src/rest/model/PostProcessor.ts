import type { Id } from './Id.js';
import type { ScriptVersion } from './ScriptVersion.js';


/** A PostProcessor script */
export interface PostProcessor {
    readonly id: Id,
    name: string,
    description: string | null,
    /** Plain-old-javascript for the PostProcessor */
    readonly js: string,
    /** Typescript-based PostProcessor script */
    ts: string,
    readonly published: boolean,
    readonly version: ScriptVersion,
    readonly created: number,
    readonly author: Id,
}

export type PostProcessorSummary = Omit<PostProcessor, 'js' | 'ts'>;
export type PostProcessorPost = Omit<PostProcessor, 'version' | 'created' | 'author' | 'published'| 'js'>;