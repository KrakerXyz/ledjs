import { hslToRgb, rgbToHex, rotateFrame, shade } from '../color-utilities';

export const netLedGlobal = {
    util: {
        color: {
            hslToRgb,
            rgbToHex,
            shade
        },
        frame: {
            rotateFrame
        }
    }
};