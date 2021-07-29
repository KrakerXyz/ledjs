import { hslToRgb, rgbToHex, rotateFrame } from '../color-utilities';

export const netLedGlobal = {
    util: {
        color: {
            hslToRgb,
            rgbToHex
        },
        frame: {
            rotateFrame
        }
    }
};