
import { computed, ref } from 'vue';
import { type ComputedRef, type Ref, watch } from 'vue';
import type { WorkerMessage } from './animationWorkerWorker';
import AnimationWorker from './animationWorkerWorker?worker';
import { createAnimation } from './createAnimation';
import { deepClone } from '$core/services/deepClone';
import { deepEquals } from '$core/services/deepEquals';
import type { CodeIssue } from '$core/services/validateScript';
import { LedArray, type LedArrayCallback } from './LedArray';

export async function useAnimationWorkerAsync(animationJs: Ref<string | null | undefined>, numLeds: Ref<number>, ledArrayCb: LedArrayCallback): Promise<WorkerContext> {
    
    let firstPassResolver: (() => void) | null = null;
    const firstPassProm = new Promise<void>(r => firstPassResolver = r);

    const animationConfig = ref<netled.common.IConfig>();
    const animationSettings = ref<netled.common.ISettings>({});

    let worker: Worker | null = null;
    let disposed = false;

    const workerIssues = ref<CodeIssue[]>([]);

    watch([animationJs, numLeds], async x => {
        const [js, numLeds] = x;
        try {
            workerIssues.value = [];
            worker?.terminate();
            worker = null;

            if (!js) { return; }
            
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

            const sab = new SharedArrayBuffer(numLeds * 4);
            const ledArray = new LedArray(sab, numLeds, 0, ledArrayCb);

            worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
                if (!e.data) { throw new Error('e.data empty'); }
                switch (e.data.type) {
                    case 'moduleError': {
                        break;
                    }
                    case 'ledArraySend': {
                        ledArray.send();
                        break;
                    }
                    default: {
                        const _: never = e.data;
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
                sab
            };
            worker.postMessage(initMessage);

            
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
    sab: SharedArrayBuffer,
}
| { 
    type: 'animationSettings',
    settings: netled.common.ISettings,
}