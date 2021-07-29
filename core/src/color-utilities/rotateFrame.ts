import { Frame } from '..';

export function rotateFrame(frame: Frame, dir: -1 | 1 = -1): void {

   if (dir === 1) {

      const ledN = frame[frame.length - 1];
      for (let i = frame.length - 2; i !== -1; i--) {
         frame[i + 1] = frame[i];
      }
      frame[0] = ledN;

   } else {

      const led0 = frame[0];
      for (let i = 0; i < frame.length - 1; i++) {
         frame[i] = frame[i + 1];
      }
      frame[frame.length - 1] = led0;

   }
}