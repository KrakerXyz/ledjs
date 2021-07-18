import { Animation } from '.';
import { Frame, RGB } from '../color-utilities';
import { Config, ConfigMeta } from './IAnimation';

const configMeta: ConfigMeta = {
   params: {
      sparking: {
         type: 'number',
         description: 'Indicates the chance (out of 255) that a spark will ignite. A higher value makes the fire more active.',
         default: 128,
         min: 1,
         max: 255
      },
      decay: {
         type: 'number',
         description: 'The amount by which the sparks will diminish at each tick. Higher numbers fade quicker.',
         default: 2,
         min: 1,
         max: 255
      },
      sideLum: {
         type: 'number',
         description: 'How bright to make the leds on the side of a new spark.',
         default: 100,
         min: 0,
         max: 255
      }
   }
}

export class Sparkle implements Animation<typeof configMeta> {

   public static meta = configMeta;

   private _frame: Frame = [];

   private _sparking: number;
   private _sideLum: number;
   private _decay: number;

   public constructor() {
      this._sparking = configMeta.params.sparking.default as number;
      this._sideLum = configMeta.params.sideLum.default as number;
      this._decay = configMeta.params.decay.default as number;
   }

   public setNumLeds(numLeds: number) {
      this._frame = [];
      for (let i = 0; i < numLeds; i++) {
         this._frame.push([0, 0, 0]);
      }
   }

   public setConfig(config: Config<typeof configMeta>) {
      this._sparking = config.sparking;
      this._sideLum = config.sideLum;
      this._decay = config.decay;
   }

   public nextFrame(): Frame {

      for (let i = 0; i < this._frame.length; i++) {
         const rgb = this._frame[i];
         addLum(rgb, -this._decay);
      }

      const numSparkles = getRandomInt(255 + 1) < this._sparking ? 1 : 0;

      for (let i = 0; i < numSparkles; i++) {
         const pos = getRandomInt(this._frame.length);

         addLum(this._frame[pos], 255);
         if (pos == 0) {
            addLum(this._frame[this._frame.length - 1], this._sideLum);
            addLum(this._frame[1], this._sideLum);
         } else if (pos === this._frame.length - 1) {
            addLum(this._frame[pos - 1], this._sideLum);
            addLum(this._frame[0], this._sideLum);
         } else {
            addLum(this._frame[pos - 1], this._sideLum);
            addLum(this._frame[pos + 1], this._sideLum);
         }
      }

      return this._frame;
   }
}

function addLum(rgb: RGB, lum: number) {
   rgb[0] = Math.max(0, Math.min(255, rgb[0] + lum));
   rgb[1] = Math.max(0, Math.min(255, rgb[1] + lum))
   rgb[2] = Math.max(0, Math.min(255, rgb[2] + lum))
}

function getRandomInt(maxExclusive: number) {
   return Math.floor(Math.random() * maxExclusive);
}