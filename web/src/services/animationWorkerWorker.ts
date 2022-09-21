import type { ClientMessage } from './animationWorker';

export type WorkerMessage = {
    type: 'Foo'
};

onmessage = async (e: MessageEvent<ClientMessage>) => {
    if (!e.data) {
        throw new Error('e.data empty');
    }

    switch (e.data.type) {
        case 'init': {
            break;
        }
        default: {
            const _: never = e.data.type;
            break;
        }
    }
};