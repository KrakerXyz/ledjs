import { Frame } from '.';

export interface AnimatorType {
    new(): Animator;
    configMeta?: ConfigMeta
}

export interface Animator {
    setNumLeds(num: number): void;
    setConfig?(config: Record<string, any>): void;
    nextFrame(): Frame
}

export interface ConfigMeta {
    params: ConfigMetaParams;
}

export type ConfigMetaParams = Record<string, ConfigMetaParam>;

export type ConfigMetaParam = {
    description: string;
    type: 'string' | 'number' | 'boolean' | 'color';
    default: string | number | boolean;
    min?: number;
    /** In cases where there's no hard min, minRecommended can be used to set the lower bounds of a slider on the UI */
    minRecommended?: number
    max?: number;
    /** In cases where there's no hard max, maxRecommended can be used to set the upper bounds of a slider on the UI */
    maxRecommended?: number;
};

export function createType(script: string): Promise<AnimatorType> {
    const blob = new Blob([script], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    return import(url).then(s => {
        if (!s.default) { throw new Error('Script did not contain a default export'); }
        return s.default;
    });

}