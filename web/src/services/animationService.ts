import * as Animations from '@/animations';

export function useAvailableAnimations(): string[] {
   return ['Flames', 'Rainbow', 'Sparkle', 'Umbrella'];
}

export function useAnimation(name: string): Animations.AnimationInstance<any> {
   if (!(Animations as any)[name]) { throw new Error('Unknown animation'); }
   return new (Animations as any)[name] as Animations.AnimationInstance<any>;
}

export function useAnimationConfigMeta(name: string): Animations.ConfigMeta | undefined {
   if (!(Animations as any)[name]) { throw new Error('Unknown animation'); }
   return (Animations as any)[name].meta;
}