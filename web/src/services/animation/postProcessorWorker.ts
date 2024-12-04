
import { computed, ref } from 'vue';
import { type ComputedRef, type Ref, watch } from 'vue';
import type { WorkerMessage } from './postProcessorWorkerWorker';
import PostProcessorWorker from './postProcessorWorkerWorker?worker';
import { createPostProcessor } from './createPostProcessor';
import { deepClone } from '$core/services/deepClone';
import { deepEquals } from '$core/services/deepEquals';
import type { CodeIssue } from '$core/services/validateScript';
import type { LedSegment } from '../../../../core/src/LedSegment';

export async function usePostProcessorWorkerAsync(postProcessorJs: Ref<string | null | undefined>, ledSegment: Readonly<Ref<LedSegment>>): Promise<WorkerContext> {
    
    let firstPassResolver: (() => void) | null = null;
    const firstPassProm = new Promise<void>(r => firstPassResolver = r);

    const postProcessorConfig = ref<netled.common.IConfig>();
    const postProcessorSettings = ref<netled.common.ISettings>({});

    let worker: Worker | null = null;
    let disposed = false;

    const workerIssues = ref<CodeIssue[]>([]);

    watch([postProcessorJs, ledSegment], async x => {
        const [js, ledSegment] = x;
        try {
            workerIssues.value = [];
            worker?.terminate();
            worker = null;

            if (!js) { return; }
            
            let postProcessor: netled.postProcessor.IPostProcessor | null = null;
            try {
                postProcessor = await createPostProcessor(js);
            } catch (e: any) {
                workerIssues.value.push({ col: 0, line: 0, severity: 'error', message: `Could not create module from script: ${e.message ?? e}` });
                return;
            }
            let newSettings = postProcessorSettings.value;
            if (!deepEquals(postProcessor.config, postProcessorConfig.value)) {
                newSettings = {};
                if (postProcessor.config) {
                    for (const key of Object.keys(postProcessor.config)) {
                        newSettings[key] = postProcessor.config![key].default;
                    }
                }
                postProcessorSettings.value = newSettings;
                postProcessorConfig.value = postProcessor.config;
            }

            if (disposed) { return; }

            worker = new PostProcessorWorker();

            worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
                if (!e.data) { throw new Error('e.data empty'); }
                switch (e.data.type) {
                    case 'moduleError': {
                        break;
                    }
                    case 'ledSegmentSend': {
                        if(disposed) { throw new Error('PostProcessorWorkerWorker is still emitting for disposed Worker'); }
                        ledSegment.send();
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
                settings: deepClone(postProcessorSettings.value),
                numLeds: ledSegment.length,
                sab: ledSegment.sab
            };
            worker.postMessage(initMessage);

            
        } finally {
            if (firstPassResolver) {
                firstPassResolver();
                firstPassResolver = null;
            }
        }
    }, { immediate: true });

    watch(postProcessorSettings, settings => {
        const message: ClientMessage = {
            type: 'postProcessorSettings',
            settings: deepClone(settings)
        };
        worker?.postMessage(message);
    });

    const execTrigger = () => {
        if (disposed) { throw new Error('Worker is disposed'); }
        const message: ClientMessage = {
            type: 'process'
        };
        worker?.postMessage(message);
        return Promise.resolve();
    };

    await firstPassProm;

    return {
        postProcessorConfig: computed(() => postProcessorConfig.value),
        postProcessorSettings,
        moduleIssues: computed(() => [...workerIssues.value]),
        execTrigger,
        dispose: () => { 
            disposed = true;
            worker?.terminate();
            worker = null;
        }
    };

}

export interface WorkerContext {
    postProcessorConfig: ComputedRef<netled.common.IConfig | undefined>,
    postProcessorSettings: Ref<netled.common.ISettings>,
    moduleIssues: ComputedRef<CodeIssue[]>,
    execTrigger: () => Promise<void>,
    /**Kills the current worker and prevents new one from starting up.*/
    dispose: () => void,
}

export type ClientMessage = {
    type: 'init',
    js: string,
    settings: netled.common.ISettings,
    numLeds: number,
    sab: SharedArrayBuffer,
} | { 
    type: 'postProcessorSettings',
    settings: netled.common.ISettings,
} | {
    type: 'process',
}