
import type { CodeIssue } from '$core/services/validateScript';
import type { ClientMessage } from './animationWorker';
import { createAnimation } from './createAnimation';
import { LedArray } from './LedArray';
import { renderCanvas } from './renderCanvas';
import { Timer } from './Timer';

export interface WorkerMessage {
    type: 'moduleError',
    errors: CodeIssue[],
}

let ledArray: LedArray | null = null;
let timer: netled.services.ITimer | null = null;
let controller: netled.animation.IAnimationController | null = null;

    
onmessage = async (e: MessageEvent<ClientMessage>) => {
    if (!e.data) {
        throw new Error('e.data empty');
    }

    switch (e.data.type) {
        case 'init': {

            const canvas = e.data.canvas;

            const animation = await createAnimation(e.data.js);
            if (!animation.construct) {
                postMessage({ type: 'moduleError', errors: [{ severity: 'error', line: 0, col: 0, message: 'Script has no construct function' }] });
                return;
            }

            const canvasDimensions: [number, number] = [canvas.width, canvas.height];
            const canvasContext = canvas.getContext('2d');
            if (!canvasContext) { throw new Error('Missing 2d canvas context'); }

            const sab = new SharedArrayBuffer(e.data.numLeds * 4);
            ledArray = new LedArray(sab, e.data.numLeds, e.data.arrayOffset, async (ledArray) => {
                renderCanvas(canvasContext, canvasDimensions, ledArray);
            });

            const services: Partial<netled.services.IServices> = {};
            for (const service of animation.services ?? []) {
                if (service === 'timer') {
                    timer = new Timer();
                    services['timer'] = timer;
                }
            }

            controller = animation.construct(ledArray, services as netled.services.IServices);
            controller.run(e.data.settings);

            break;
        }
        case 'animationSettings': {
            controller?.run(e.data.settings);
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