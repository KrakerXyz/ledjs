import { hexToRgb } from './color-utilities/hexToRgb.js';
import { hslToRgb } from './color-utilities/hslToRgb.js';

export const netledGlobal = {
    utils: {
        color: {
            hslToRgb,
            hexToRgb
        }
    },
    animation: {
        defineAnimation(animation: netled.animation.IAnimation<netled.services.IAvailableServices>): netled.animation.IAnimation<netled.services.IAvailableServices> {
            return animation;
        }
    },
    postProcessor: {
        definePostProcessor(postProcessor: netled.postProcessor.IPostProcessor): netled.postProcessor.IPostProcessor { return postProcessor; }
    },
}