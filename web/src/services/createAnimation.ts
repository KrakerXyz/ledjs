import { hslToRgb, hexToRgb } from '@krakerxyz/netled-core';

export async function createAnimation(js: string): Promise<netled.animation.IAnimation> {
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
            }
        };
    }

    const b64moduleData = 'data:text/javascript;base64,' + btoa(js);
    const module = await import(/* @vite-ignore */ b64moduleData);

    if (!module.default) {
        throw new Error('Script does not have default export');
    }

    const animation = module.default as netled.animation.IAnimation;
    return animation;

}