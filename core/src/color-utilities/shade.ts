import { ARGB } from '../animation';

export function shade(rgb: ARGB, decimal: number) {
    rgb[1] += Math.min(255, Math.round(rgb[1] * decimal));
    rgb[2] += Math.min(255, Math.round(rgb[2] * decimal));
    rgb[3] += Math.min(255, Math.round(rgb[3] * decimal));
}