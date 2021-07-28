import { ARGB } from '..';

//https://css-tricks.com/converting-color-spaces-in-javascript/#hsl-to-rgb
export function rgbToHex(argb: ARGB): string {
   const r = argb[1].toString(16);
   const g = argb[2].toString(16);
   const b = argb[3].toString(16);

   const hex = `#${r.padStart(2, '0')}${g.padStart(2, '0')}${b.padStart(2, '0')}`;
   return hex;
}