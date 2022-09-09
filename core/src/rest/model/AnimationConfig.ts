import { Id, AnimationVersion } from '..';

export interface AnimationConfig {
    /** Id of this specific animation config */
    readonly id: Id;
    readonly userId: Id;
    /** Id of the animation to render */
    readonly animationId: Id;
    /** Version of animation this config is for */
    readonly version: AnimationVersion;
    /** Name for this configuration */
    name: string;
    /** Description for the configuration */
    description?: string | null;
    /** Configuration data for the animation */
    config: Record<string, number | string>;
}

export interface AnimationConfigSummary extends Omit<AnimationConfig, 'config'> {
    animationName: string;
}

export type AnimationConfigPost = Omit<AnimationConfig, 'userId'>;
