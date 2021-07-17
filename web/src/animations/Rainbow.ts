import { Animation } from '.';
import { Frame, hslToRgb, rotateFrame } from '../color-utilities';

export class Rainbow implements Animation<any> {

   private _frame: Frame = [];

   public setNumLeds(num: number) {
      this._frame = [];
      const space = 360 / num;
      for (let i = 0; i < num; i++) {
         const h = i * space;
         const rgb = hslToRgb(h, 50, 50);
         this._frame.push(rgb);
      }
   }

   public setConfig() {

   }

   public nextFrame(): Frame {
      rotateFrame(this._frame);
      return this._frame;
   }
}