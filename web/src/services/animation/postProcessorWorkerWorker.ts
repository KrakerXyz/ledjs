
import type { CodeIssue } from '$core/services/validateScript';
import type { ClientMessage } from './postProcessorWorker';
import { LedSegment } from './LedSegment';
import { createPostProcessor } from './createPostProcessor';

export type WorkerMessage = {
    type: 'moduleError',
    errors: CodeIssue[],
} | {
    type: 'ledSegmentSend',
}

let ledSegment: LedSegment | null = null;
let controller: netled.postProcessor.IPostProcessorController | null = null;
let settings: netled.common.ISettings | null = null;

    
onmessage = async (e: MessageEvent<ClientMessage>) => {
    if (!e.data) {
        throw new Error('e.data empty');
    }

    switch (e.data.type) {
        case 'init': {

            const postProcessor = await createPostProcessor(e.data.js);
            if (!postProcessor.construct) {
                postMessage({ type: 'moduleError', errors: [{ severity: 'error', line: 0, col: 0, message: 'Script has no construct function' }] });
                return;
            }

            ledSegment = new LedSegment(e.data.sab, e.data.numLeds, e.data.arrayOffset);
            ledSegment.addSendCallback(async () => {
                postMessage({ type: 'ledSegmentSend' });
            });

            settings = e.data.settings;

            controller = postProcessor.construct(ledSegment, settings);

            break;
        }
        case 'postProcessorSettings': {
            settings = e.data.settings;
            break;
        }
        case 'process': {
            if (!controller) { 
                //throw new Error('Controller not initialized');
                return;
            }

            controller.exec();
            break;   
        }
        default: {
            const _: never = e.data;
            break;
        }
    }
};

function postMessage(message: WorkerMessage): void {
    globalThis.postMessage(message);
}