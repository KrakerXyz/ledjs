import { Frame } from '.';

export function rotateFrame(frame: Frame, dir: -1 | 1 = -1): void {
   const led0 = frame[0];
   for (let i = 1; i < frame.length; i++) {
      frame[i - 1] = frame[i];
   }
   frame[frame.length - 1] = led0;
}