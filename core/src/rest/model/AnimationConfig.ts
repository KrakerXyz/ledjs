import type { Id } from './Id.js';
import type { ScriptVersion } from './ScriptVersion.js';

export interface AnimationConfig {
    /** Id of this specific animation config */
    readonly id: Id,
    readonly userId: Id,

    readonly animation: {
        /** Id of the animation the config is for */
        id: Id,
        /** Version of animation this config is for */
        version: ScriptVersion,
    },
    /** Name for this configuration */
    name: string,
    /** Description for the configuration */
    description?: string | null,
    /** Configuration data for the animation */
    config: Record<string, number | string>,
}

export interface AnimationConfigSummary extends Omit<AnimationConfig, 'config'> {
    animationName: string,
}

export type AnimationConfigPost = Omit<AnimationConfig, 'userId'>;
