import { computed } from 'vue';
import { ComputedRef, Ref, watch } from 'vue';
import type { WorkerMessage } from './animationWorkerWorker';
import AnimationWorker from './animationWorkerWorker?worker';
import { createAnimation } from './createAnimation';

export function useAnimationWorker(canvas: HTMLCanvasElement, animationJs: Ref<string>): WorkerContext {
    if (!canvas.transferControlToOffscreen) { throw new Error('canvas.transferControlToOffscreen not supported'); }
    const offscreen = canvas.transferControlToOffscreen();

    let worker: Worker | null = null;
    let disposed = false;

    const animationConfig = computed(async () => {
        if (!animationJs.value) { return undefined; }

        const animation = await createAnimation(animationJs.value);

        return animation.config ?? null;
    });

    watch(animationJs, js => {

        worker?.terminate();
        worker = null;

        if (disposed) { return; }

        worker = new AnimationWorker();

        worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
            if (!e.data) { throw new Error('e.data empty'); }
            switch (e.data.type) {
                case 'Foo': {
                    break;
                }
                default: {
                    const _: never = e.data.type;
                    break;
                }
            }
        });

        worker.postMessage({
            type: 'init',
            canvas: offscreen,
            js
        } as ClientMessage, [offscreen]);

    });

    return {
        animationConfig,
        dispose: () => { 
            disposed = true;
            worker?.terminate();
            worker = null;
        }
    };

}

export interface WorkerContext {
    animationConfig: ComputedRef<Promise<netled.common.IConfig | null | undefined>>,
    //Kills the current worker and prevents new one from starting up.
    dispose: () => void
}

export type ClientMessage = {
    type: 'init',
    js: string,
    canvas: OffscreenCanvas
}