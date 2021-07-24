import { ARGB } from '..';

//https://css-tricks.com/converting-color-spaces-in-javascript/#hsl-to-rgb
export function rgbToHex(rgb: ARGB): string {
   const r = rgb[1].toString(16);
   const g = rgb[2].toString(16);
   const b = rgb[3].toString(16);

   const hex = `#${r.padStart(2, '0')}${g.padStart(2, '0')}${b.padStart(2, '0')}`;
   return hex;
}