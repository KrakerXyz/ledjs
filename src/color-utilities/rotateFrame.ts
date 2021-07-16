import { Frame } from '.';

export function rotateFrame(frame: Frame, dir: -1 | 1 = -1): void {
   const ledN = frame[frame.length - 1];
   for (let i = frame.length - 2; i !== -1; i--) {
      frame[i + 1] = frame[i];
   }
   frame[0] = ledN;
}