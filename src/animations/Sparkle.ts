import { Animation } from '.';
import { Frame, RGB } from '../color-utilities';

export class Sparkle implements Animation<any> {

   private _frame: Frame = [];

   public setNumLeds(numLeds: number) {
      this._frame = [];
      for (let i = 0; i < numLeds; i++) {
         this._frame.push([0, 0, 0]);
      }
   }

   public setConfig() {

   }

   private readonly MAX_ADD = 1;
   private readonly SIDE_LUM = 100;
   private readonly DECAY = 2;

   public nextFrame(): Frame {

      for (let i = 0; i < this._frame.length; i++) {
         const rgb = this._frame[i];
         addLum(rgb, -this.DECAY);
      }

      const numSparkles = getRandomInt(this.MAX_ADD + 1);

      for (let i = 0; i < numSparkles; i++) {
         const pos = getRandomInt(this._frame.length);

         addLum(this._frame[pos], 255);
         if (pos == 0) {
            addLum(this._frame[this._frame.length - 1], this.SIDE_LUM);
            addLum(this._frame[1], this.SIDE_LUM);
         } else if (pos === this._frame.length - 1) {
            addLum(this._frame[pos - 1], this.SIDE_LUM);
            addLum(this._frame[0], this.SIDE_LUM);
         } else {
            addLum(this._frame[pos - 1], this.SIDE_LUM);
            addLum(this._frame[pos + 1], this.SIDE_LUM);
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