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
    /** When true, the animation will render one frame then stop the clock */
    oneShot?: boolean;
    params: ConfigMetaParams;
}

export type ConfigMetaParams = Record<string, ConfigMetaParam>;

export type ConfigMetaParam = ConfigMetaParamNumber | ConfigMetaParamString | ConfigMetaParamColor

export type ConfigMetaParamNumber = {
    description: string;
    type: 'number';
    default: number;
    min?: number;
    /** In cases where there's no hard min, minRecommended can be used to set the lower bounds of a slider on the UI */
    minRecommended?: number
    max?: number;
    /** In cases where there's no hard max, maxRecommended can be used to set the upper bounds of a slider on the UI */
    maxRecommended?: number;
};

export type ConfigMetaParamString = {
    description: string;
    type: 'string';
    default: string;
};

export type ConfigMetaParamColor = {
    description: string;
    type: `#${string}`;
    default: string;
};

export function createType(script: string): Promise<AnimatorType> {
    const blob = new Blob([script], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    return import(url).then(s => {
        if (!s.default) { throw new Error('Script did not contain a default export'); }
        return s.default;
    });

}