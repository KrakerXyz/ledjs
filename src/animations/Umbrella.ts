import { Frame } from '../color-utilities';
import { IAnimation } from '.';
import { rotateFrame } from '../color-utilities/rotateFrame';

export class Umbrella implements IAnimation {

   private readonly _frame: Frame;

   public constructor(numLeds: number) {

      const leds: Frame = [];
      let lastWasWhite = false;
      for (let i = 0; i < numLeds; i++) {
         const pct = i / numLeds;
         if (pct < 0.25 || (pct >= 0.5 && pct < 0.75)) {
            if (!lastWasWhite) {
               lastWasWhite = true;
               leds.push([0, 0, 0]);
               i++;
            }
            leds.push([200, 0, 0]);
         } else {
            if (lastWasWhite) {
               lastWasWhite = false;
               leds.push([0, 0, 0]);
               i++;
            }
            leds.push([255, 255, 255]);
         }
      }

      this._frame = leds;
   }

   public nextFrame(): Frame {
      rotateFrame(this._frame);
      return this._frame;
   }

}