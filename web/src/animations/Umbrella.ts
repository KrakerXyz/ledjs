import { Frame } from '../color-utilities';
import { AnimationInstance } from '.';
import { rotateFrame } from '../color-utilities/rotateFrame';

export class Umbrella implements AnimationInstance<any> {

   private _frame: Frame = [];

   public setNumLeds(numLeds: number) {
      this._frame = [];
      let lastWasWhite = false;
      for (let i = 0; i < numLeds; i++) {
         const pct = i / numLeds;
         if (pct < 0.25 || (pct >= 0.5 && pct < 0.75)) {
            if (!lastWasWhite) {
               lastWasWhite = true;
               this._frame.push([0, 0, 0]);
               i++;
            }
            this._frame.push([200, 0, 0]);
         } else {
            if (lastWasWhite) {
               lastWasWhite = false;
               this._frame.push([0, 0, 0]);
               i++;
            }
            this._frame.push([255, 255, 255]);
         }
      }
   }

   public setConfig() {

   }

   public nextFrame(): Frame {
      rotateFrame(this._frame);
      return this._frame;
   }

}