import { hexToRgb } from '$core/color-utilities/hexToRgb';
import { hslToRgb } from '$core/color-utilities/hslToRgb';

export function ensureNetledNamespace() {
    if (!(globalThis as any).netled) {
        (globalThis as any).netled = {
            utils: {
                color: {
                    hslToRgb,
                    hexToRgb
                }
            },
            animation: {
                defineAnimation(animation: netled.animation.IAnimation<netled.services.IAvailableServices>): netled.animation.IAnimation<netled.services.IAvailableServices> { return animation; }
            },
            postProcessor: {
                definePostProcessor(postProcessor: netled.postProcessor.IPostProcessor): netled.postProcessor.IPostProcessor { return postProcessor; }
            },
        };
    }
}