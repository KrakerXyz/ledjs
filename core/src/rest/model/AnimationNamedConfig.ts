import { AnimationConfig } from '.';
import { AjvSchema } from '../AjvSchema';
import { animationConfigSchema } from './AnimationConfig';

export interface AnimationNamedConfig {
    readonly id: string;
    readonly userId: string;
    name: string;
    animation: AnimationConfig
}

export type AnimationNamedConfigPost = Omit<AnimationNamedConfig, 'userId'>;

export const animationNamedConfigPostSchema: AjvSchema<AnimationNamedConfigPost> = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        animation: animationConfigSchema
    },
    required: ['id', 'name', 'animation'],
    additionalProperties: false
};