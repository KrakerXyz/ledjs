
import { AnimationConfig } from '.';
import { Id } from '..';

export interface AnimationNamedConfig {
    readonly id: Id;
    readonly userId: string;
    name: string;
    description?: string | null;
    animation: AnimationConfig
}

export interface AnimationNamedConfigSummary extends Omit<AnimationNamedConfig, 'animation'> {
    animationName: string;
    animationVersion: number;
}

export type AnimationNamedConfigPost = Omit<AnimationNamedConfig, 'userId'>;
