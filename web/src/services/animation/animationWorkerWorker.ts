
import type { ClientMessage } from '@/services';
import { createAnimation } from '@/services/animation/createAnimation';
import type { CodeIssue } from '@krakerxyz/netled-core';

export type WorkerMessage = {
    type: 'moduleError',
    errors: CodeIssue[]
};

// const ledArray: LedArray | null = null;
// const timer: netled.services.ITimer | null = null;
// const controller: netled.animation.IAnimationController | null = null;

onmessage = async (e: MessageEvent<ClientMessage>) => {
    if (!e.data) {
        throw new Error('e.data empty');
    }

    switch (e.data.type) {
        case 'init': {
            const animation = await createAnimation(e.data.js);
            if (!animation.construct) {
                postMessage({ type: 'moduleError', errors: [{ severity: 'error', line: 0, col: 0, message: 'Script has no construct function' }] });
                return;
            }

            // const canvas = e.data.canvas;
            // const canvasDimensions: [number, number] = [canvas.width, canvas.height];
            // const canvasContext = canvas.getContext('2d');
            // if (!canvasContext) { throw new Error('Missing 2d canvas context'); }

            // const sab = new SharedArrayBuffer(e.data.numLeds * 4);
            // ledArray = new LedArray(sab, e.data.numLeds, e.data.arrayOffset, async (ledArray) => {
            //     renderCanvas(canvasContext, canvasDimensions, ledArray);
            // });

            // const services: Partial<netled.services.IServices> = {};
            // for (const service of animation.services ?? []) {
            //     if (service === 'timer') {
            //         timer = new Timer();
            //         services['timer'] = timer;
            //     }
            // }

            // controller = animation.construct(ledArray, services as netled.services.IServices);
            // controller.run(e.data.settings);

            break;
        }
        case 'animationSettings': {
            //controller?.run(e.data.settings);
            break;
        }
        default: {
            const _: never = e.data;
            break;
        }
    }
};

// function postMessage(message: WorkerMessage): void {
//     globalThis.postMessage(message);
// }