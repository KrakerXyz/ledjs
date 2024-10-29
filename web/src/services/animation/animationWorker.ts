
import { computed, ref } from 'vue';
import { type ComputedRef, type Ref, watch } from 'vue';
import type { WorkerMessage } from './animationWorkerWorker';
import AnimationWorker from './animationWorkerWorker?worker';
import { createAnimation } from './createAnimation';
import { type CodeIssue, deepEquals, deepClone } from '$core/services';

export async function useAnimationWorkerAsync(canvasContainer: Ref<HTMLDivElement | undefined>, animationJs: Ref<string | null | undefined>, numLeds: Ref<number>): Promise<WorkerContext> {
    
    let firstPassResolver: (() => void) | null = null;
    const firstPassProm = new Promise<void>(r => firstPassResolver = r);

    const animationConfig = ref<netled.common.IConfig>();
    const animationSettings = ref<netled.common.ISettings>({});

    let worker: Worker | null = null;
    let disposed = false;

    let canvas: HTMLCanvasElement | null = null;

    const workerIssues = ref<CodeIssue[]>([]);

    watch([animationJs, numLeds, canvasContainer], async x => {
        const [js, numLeds, canvasContainer] = x;
        try {
            workerIssues.value = [];
            worker?.terminate();
            worker = null;
            canvas?.remove();

            if (!js) { return; }
            if (!canvasContainer) { return; }

            canvas = document.createElement('canvas');
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvasContainer.appendChild(canvas);
            
            if (!canvas.transferControlToOffscreen) { throw new Error('canvas.transferControlToOffscreen not supported'); }
            const offscreenCanvas = canvas.transferControlToOffscreen();

            let animation: netled.animation.IAnimation | null = null;
            try {
                animation = await createAnimation(js);
            } catch (e: any) {
                workerIssues.value.push({ col: 0, line: 0, severity: 'error', message: `Could not create module from script: ${e.message ?? e}` });
                return;
            }
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
                js,
                settings: deepClone(animationSettings.value),
                numLeds,
                arrayOffset: 0,
                canvas: offscreenCanvas
            };
            worker.postMessage(initMessage, [offscreenCanvas]);

            
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
            settings: deepClone(settings)
        };
        worker?.postMessage(message);
    });

    await firstPassProm;

    return {
        animationConfig: computed(() => animationConfig.value),
        animationSettings,
        moduleIssues: computed(() => [...workerIssues.value]),
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
    moduleIssues: ComputedRef<CodeIssue[]>,
    /**Kills the current worker and prevents new one from starting up.*/
    dispose: () => void,
}

export type ClientMessage = {
    type: 'init',
    js: string,
    settings: netled.common.ISettings,
    numLeds: number,
    arrayOffset: number,
    canvas: OffscreenCanvas,
}
| { 
    type: 'animationSettings',
    settings: netled.common.ISettings,
}