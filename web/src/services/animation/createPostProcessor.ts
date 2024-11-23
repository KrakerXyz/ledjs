import { ensureNetledNamespace } from './ensureNetledNamespace';

export async function createPostProcessor(js: string): Promise<netled.postProcessor.IPostProcessor> {

    ensureNetledNamespace();

    const b64moduleData = 'data:text/javascript;base64,' + btoa(js);
    const module = await import(/* @vite-ignore */ b64moduleData);

    if (!module.default) {
        throw new Error('Script does not have default export');
    }

    const postProcessor = module.default as netled.postProcessor.IPostProcessor;
    return postProcessor;

}