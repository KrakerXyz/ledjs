import { IAnimation } from '.';
import { Frame, hslToRgb, rotateFrame } from '../color-utilities';

export class Rainbow implements IAnimation {

   private readonly _frame: Frame;

   public constructor(numLeds: number) {

      const space = 360 / numLeds;

      const leds: Frame = [];
      for (let i = 0; i < numLeds; i++) {
         const h = i * space;
         const rgb = hslToRgb(h, 50, 50);
         leds.push(rgb);
      }

      this._frame = leds;
   }

   public nextFrame(): Frame {
      rotateFrame(this._frame);
      return this._frame;
   }
}