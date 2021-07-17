import * as Animations from '../animations';

export function useAvailableAnimations(): string[] {
   return ['Flames', 'Rainbow', 'Sparkle', 'Umbrella'];
}

export function useAnimation(name: string): Animations.Animation<any> {
   if (!(Animations as any)[name]) { throw new Error('Unknown animation'); }
   return new (Animations as any)[name] as Animations.Animation<any>;
}