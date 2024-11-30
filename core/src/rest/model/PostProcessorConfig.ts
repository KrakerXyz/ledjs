
import type { Id } from './Id.js';
import type { ScriptVersion } from './ScriptVersion.js';

export interface PostProcessorConfig {
    readonly id: Id,
    readonly userId: Id,
    readonly postProcessor: {
        id: Id,
        version: ScriptVersion,
    },
    name: string,
    description?: string | null,
    config: Record<string, number | string | boolean>,
}

export interface PostProcessorConfigSummary extends Omit<PostProcessorConfig, 'config'> {
    postProcessorName: string,
}

export type PostProcessorConfigPost = Omit<PostProcessorConfig, 'userId'>;