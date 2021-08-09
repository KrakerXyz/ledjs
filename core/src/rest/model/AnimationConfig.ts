import { AjvSchema } from '..';

export interface AnimationConfig {
    /** Id of the animation to render */
    readonly id: string;
    /** Version of animation */
    version: number;
    /** Animation configuration */
    config?: Record<string, any>;
    /** Interval in milliseconds in which to render a frame. e.g. 33ms for 30FPS */
    interval: number;
    /** Global brightness modifiers. A ratio (0-1) applied to each frame's led brightness. */
    brightness: number;
}

export const animationConfigSchema: AjvSchema<AnimationConfig> = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        version: { type: 'number' },
        brightness: { type: 'number' },
        interval: { type: 'number' },
        config: { type: 'object' }
    },
    required: ['id', 'version', 'brightness', 'interval'],
    additionalProperties: false
};