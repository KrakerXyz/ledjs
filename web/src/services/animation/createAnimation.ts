import { ensureNetledNamespace } from './ensureNetledNamespace';


export async function createAnimation(js: string): Promise<netled.animation.IAnimation> {
    ensureNetledNamespace();

    const b64moduleData = 'data:text/javascript;base64,' + btoa(js);
    const module = await import(/* @vite-ignore */ b64moduleData);

    if (!module.default) {
        throw new Error('Script does not have default export');
    }

    const animation = module.default as netled.animation.IAnimation;
    return animation;

}