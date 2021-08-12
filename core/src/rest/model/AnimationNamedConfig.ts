
import { AnimationConfig } from '.';
import { Id } from '..';

export interface AnimationNamedConfig {
    readonly id: Id;
    readonly userId: string;
    name: string;
    description?: string | null;
    animation: AnimationConfig
}

export type AnimationNamedConfigPost = Omit<AnimationNamedConfig, 'userId'>;
