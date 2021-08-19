import { ARGB } from '..';

/** Converts a hex value such as #ff7734eb to an ARGB array like [255, 119, 52, 235]. If given hex does not contain an Alpha (#7734eb), 255 is defaulted. If hex is malformed, [0, 0, 0, 0] is returned. */
export function hexToRgb(hex: string): ARGB {
    if (!hex) { return [0, 0, 0, 0]; }
    if (hex.startsWith('#')) { hex = hex.substring(1); }
    if (hex.length === 6) { hex = 'ff' + hex; }
    if (hex.length !== 8) { return [0, 0, 0, 0]; }

    return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16),
        parseInt(hex.substring(6, 8), 16),
    ];

}