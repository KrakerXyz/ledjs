import { hslToRgb, rgbToHex, rotateFrame, shade, hexToRgb } from '../color-utilities';

export const netLedGlobal = {
    util: {
        color: {
            hslToRgb,
            rgbToHex,
            shade,
            hexToRgb
        },
        frame: {
            rotateFrame
        }
    }
};