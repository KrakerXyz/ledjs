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
    type: 'string' | 'number' | 'boolean';
    default: string | number | boolean;
    min?: number;
    max?: number;
};

export function createType(script: string): Promise<AnimatorType> {
    const blob = new Blob([script], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    return import(url).then(s => {
        if (!s.default) { throw new Error('Script did not contain a default export'); }
        return s.default;
    });

}