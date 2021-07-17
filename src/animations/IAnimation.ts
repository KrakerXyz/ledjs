import { Frame } from '../color-utilities';

export type Config<TMeta extends ConfigMeta> = Record<keyof TMeta['params'], any>;

export interface Animation<TMeta extends ConfigMeta> {
   setNumLeds(num: number): void;
   setConfig(config: Config<TMeta>): void;
   nextFrame(): Frame
}

export interface ConfigMeta {
   params: ConfigMetaParams;
}

export type ConfigMetaParams = Record<string, {
   description: string;
   type: 'string' | 'number' | 'boolean';
   default: string | number | boolean;
   min?: number;
   max?: number;
}
>;