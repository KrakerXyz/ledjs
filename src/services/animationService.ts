import * as Animations from '@/animations';
import { ref, Ref } from 'vue';

export function useAvailableAnimations(): string[] {
   return ['Flames', 'Rainbow', 'Sparkle', 'Umbrella'];
}

const animationContext: AnimationContext = {
   animation: ref(),
   interval: ref(50)
}
export function useAnimationContext(): AnimationContext {
   return animationContext;
}

export function useAnimation(name: string): Animations.Animation<any> {
   if (!(Animations as any)[name]) { throw new Error('Unknown animation'); }
   return new (Animations as any)[name] as Animations.Animation<any>;
}

export interface AnimationContext {
   animation: Ref<Animations.Animation<any> | undefined>;
   interval: Ref<number>;
}