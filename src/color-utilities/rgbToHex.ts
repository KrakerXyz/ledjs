import { RGB } from '.';

//https://css-tricks.com/converting-color-spaces-in-javascript/#hsl-to-rgb
export function rgbToHex(rgb: RGB): string {
   const r = rgb[0].toString(16);
   const g = rgb[1].toString(16);
   const b = rgb[2].toString(16);

   const hex = `#${r.padStart(2, '0')}${g.padStart(2, '0')}${b.padStart(2, '0')}`;
   return hex;
}