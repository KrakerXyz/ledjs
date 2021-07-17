import { Frame } from '../color-utilities';
import { Animation } from '.';
import { Config, ConfigMeta } from './IAnimation';

//https://www.tweaking4all.com/hardware/arduino/adruino-led-strip-effects/

const configMeta: ConfigMeta = {
   params: {
      cooling: {
         type: 'number',
         description: 'Indicates how fast a flame cools down. More cooling means shorter flames.',
         default: 65,
         min: 1,
         max: 255
      },
      sparking: {
         type: 'number',
         description: 'Indicates the chance (out of 255) that a spark will ignite. A higher value makes the fire more active.',
         default: 50,
         min: 1,
         max: 255
      }
   }
}

export class Flames implements Animation<typeof configMeta> {

   public static meta = configMeta;

   private _cooling: number;
   private _sparking: number;

   private readonly _heat: number[] = [];
   private _frame: Frame = [];

   public constructor() {

      this._cooling = configMeta.params.cooling.default as number;
      this._sparking = configMeta.params.sparking.default as number;

   }

   public setNumLeds(num: number) {
      if (num === this._frame.length) { return; }
      this._frame = [];
      for (let i = 0; i < num; i++) {
         this._frame.push([0, 0, 0]);
         this._heat.push(0);
      }
   }

   public setConfig(config: Config<typeof configMeta>) {
      this._cooling = config.cooling;
      this._sparking = config.sparking;
   }

   public nextFrame(): Frame {

      const heat = this._heat;

      // Step 1.  Cool down every cell a little
      for (let i = 0; i < this._frame.length; i++) {
         const cooldown = getRandomInt(((this._cooling * 10) / this._frame.length) + 2);
         heat[i] -= cooldown;
         if (heat[i] < 0) { heat[i] = 0; }
      }

      // Step 2.  Heat from each cell drifts 'up' and diffuses a little
      for (let i = this._frame.length; i >= 2; i--) {
         heat[i] = (heat[i - 1] + heat[i - 2] + heat[i - 2]) / 3;
         if (heat[i] > 255) { heat[i] = 255; }
      }

      // Step 3.  Randomly ignite new 'sparks' near the bottom
      if (getRandomInt(255) < this._sparking) {
         const y = getRandomInt(7);
         heat[y] += getRandomInt(95) + 160;
         if (heat[y] > 255) { heat[y] = 255; }
      }

      // Step 4.  Convert heat to LED colors
      for (let i = 0; i < this._frame.length; i++) {

         // Scale 'heat' down from 0-255 to 0-191
         const t192 = Math.round((heat[i] / 255.0) * 191);

         // calculate ramp up from
         let heatramp = t192 & 0x3F; // 0..63
         heatramp <<= 2; // scale up to 0..252

         // figure out which third of the spectrum we're in:
         if (t192 > 128) {                     // hottest
            this._frame[i] = [255, 255, heatramp];
         } else if (t192 > 64) {             //  middle
            this._frame[i] = [255, heatramp, 0];
         } else {
            this._frame[i] = [heatramp, 0, 0];// coolest
         }

      }

      return this._frame;
   }

}

function getRandomInt(maxExclusive: number) {
   return Math.floor(Math.random() * maxExclusive);
}