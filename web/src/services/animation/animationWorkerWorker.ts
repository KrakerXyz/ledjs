
import type { CodeIssue } from '$core/services/validateScript';
import type { ClientMessage } from './animationWorker';
import { createAnimation } from './createAnimation';
import { LedSegment } from '../../../../core/src/LedSegment';
import { Timer } from './Timer';

export type WorkerMessage = {
    type: 'moduleError',
    errors: CodeIssue[],
} | {
    type: 'ledSegmentSend',
}

let ledSegment: LedSegment | null = null;
let timer: netled.services.ITimer | null = null;
let controller: netled.animation.IAnimationController | null = null;

    
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

            ledSegment = new LedSegment(e.data.sab, e.data.numLeds, e.data.arrayOffset, e.data.deadLeds);
            ledSegment.addSendCallback(async () => {
                postMessage({ type: 'ledSegmentSend' });
            });

            const services: Partial<netled.services.IServices> = {};
            for (const service of animation.services ?? []) {
                if (service === 'timer') {
                    timer = new Timer();
                    services['timer'] = timer;
                }
            }

            controller = animation.construct(ledSegment, services as netled.services.IServices);
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