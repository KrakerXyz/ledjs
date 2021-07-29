import { Frame } from '.';

export type Config<TMeta extends ConfigMeta> = Record<keyof TMeta['params'], any>;

export interface AnimatorType<TMeta extends ConfigMeta> {
    new(): Animator<TMeta>;
    configMeta?: ConfigMeta
}

export interface Animator<TMeta extends ConfigMeta> {
    setNumLeds(num: number): void;
    setConfig?(config: Config<TMeta>): void;
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

export function createType<TMeta extends ConfigMeta>(script: string): Promise<AnimatorType<TMeta>> {
    const blob = new Blob([script], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    return import(url).then(s => {
        if (!s.default) { throw new Error('Script did not contain a default export'); }
        return s.default;
    });

}