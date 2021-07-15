import { Frame } from '../color-utilities';

export interface IAnimation {
   nextFrame(): Frame
}

export interface IConfigMeta {
   params: IConfigMetaParam[];
}

type DefaultType<TT> = TT extends 'string' ? string : TT extends 'number' ? number : boolean;

export interface IConfigMetaParam {
   name: string;
   description: string;
   type: 'string' | 'number' | 'boolean';
   default?: string | number | boolean;
   min?: number;
   max?: number;
}