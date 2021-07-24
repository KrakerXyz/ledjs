import * as Animations from '@/animations';

export function useAnimationConfigMeta(name: string): Animations.ConfigMeta | undefined {
   if (!(Animations as any)[name]) { throw new Error('Unknown animation'); }
   return (Animations as any)[name].meta;
}