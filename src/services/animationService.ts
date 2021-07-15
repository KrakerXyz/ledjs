import * as Animations from '@/animations';

type Config = Record<string, any>;

export function useAvailableAnimations(): string[] {
   return ['Flames', 'Rainbow', 'Sparkle', 'Umbrella'];
}

export function useAnimationService(numLeds: number) {
   return {
      getContext(animationName: string): Promise<IAnimationContext> {
         let ctx: IAnimationContext | undefined;

         switch (animationName) {
            case 'Flames': {
               const meta = Animations[animationName].meta;
               const config = createDefaultConfig(meta);
               ctx = {
                  animation: new Animations[animationName](numLeds, config as any),
                  config,
                  meta,
                  setConfig(c) {
                     this.animation = new Animations[animationName](numLeds, c as any)
                  }
               }

               break;
            }
            case 'Rainbow':
            case 'Sparkle':
            case 'Umbrella': {
               ctx = {
                  animation: new Animations[animationName](numLeds),
                  config: {},
                  meta: { params: [] },
                  setConfig(c) {
                     this.animation = new Animations[animationName](numLeds);
                  }
               }
               break;
            }
            default: throw new Error('Unknown animation');
         }

         return Promise.resolve(ctx!);
      }
   };
};

function createDefaultConfig(meta: Animations.IMeta): Config {
   const config: Config = {};

   for (const param of meta.params) {
      config[param.name] = param.default;
   }

   return config;
}

export interface IAnimationContext {
   animation: Animations.IAnimation;
   meta: Animations.IMeta;
   config: Config;
   setConfig(config: Config): void;
}