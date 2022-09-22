import { deepEquals } from '@krakerxyz/netled-core';
import { computed, ref } from 'vue';
import { ComputedRef, Ref, watch } from 'vue';
import type { WorkerMessage } from './animationWorkerWorker';
import AnimationWorker from './animationWorkerWorker?worker';
import { createAnimation } from './createAnimation';

export async function useAnimationWorkerAsync(canvas: Ref<HTMLCanvasElement | undefined>, animationJs: Ref<string | null | undefined>, numLeds: Ref<number>): Promise<WorkerContext> {
    
    let firstPassResolver: (() => void) | null = null;
    const firstPassProm = new Promise<void>(r => firstPassResolver = r);

    const animationConfig = ref<netled.common.IConfig>();
    const animationSettings = ref<netled.common.ISettings>({});

    let worker: Worker | null = null;
    let disposed = false;

    watch([animationJs, canvas, numLeds], async x => {
        const [js, canvas, numLeds] = x;
        try {

            worker?.terminate();
            worker = null;

            if (!js) { return; }

            if (!canvas) { return; }
            if (!canvas.transferControlToOffscreen) { throw new Error('canvas.transferControlToOffscreen not supported'); }
            const offscreen = canvas.transferControlToOffscreen();

            const animation = await createAnimation(js);
            let newSettings = animationSettings.value;
            if (!deepEquals(animation.config, animationConfig.value)) {
                newSettings = {};
                if (animation.config) {
                    for (const key of Object.keys(animation.config)) {
                        newSettings[key] = animation.config![key].default;
                    }
                }
                animationSettings.value = newSettings;
                animationConfig.value = animation.config;
            }

            if (disposed) { return; }

            worker = new AnimationWorker();

            worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
                if (!e.data) { throw new Error('e.data empty'); }
                switch (e.data.type) {
                    case 'moduleError': {
                        break;
                    }
                    default: {
                        const _: never = e.data.type;
                        break;
                    }
                }
            });

            const initMessage: ClientMessage = {
                type: 'init',
                canvas: offscreen,
                js,
                settings: animationSettings.value,
                numLeds,
                arrayOffset: 0
            };
            worker.postMessage(initMessage, [offscreen]);

            
        } finally {
            if (firstPassResolver) {
                firstPassResolver();
                firstPassResolver = null;
            }
        }
    }, { immediate: true });

    watch(animationSettings, settings => {
        const message: ClientMessage = {
            type: 'animationSettings',
            settings
        };
        worker?.postMessage(message);
    });

    await firstPassProm;

    return {
        animationConfig: computed(() => animationConfig.value),
        animationSettings,
        dispose: () => { 
            disposed = true;
            worker?.terminate();
            worker = null;
        }
    };

}

export interface WorkerContext {
    animationConfig: ComputedRef<netled.common.IConfig | undefined>,
    animationSettings: Ref<netled.common.ISettings>,
    /**Kills the current worker and prevents new one from starting up.*/
    dispose: () => void
}

export type ClientMessage = {
    type: 'init',
    js: string,
    canvas: OffscreenCanvas,
    settings: netled.common.ISettings,
    numLeds: number,
    arrayOffset: number
}
| { 
    type: 'animationSettings',
    settings: netled.common.ISettings
}