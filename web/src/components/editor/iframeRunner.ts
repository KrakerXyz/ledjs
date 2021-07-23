import { Frame } from '@/color-utilities';

export function useIframeRunner(script: string): Promise<IFrameContext> {

    return new Promise<IFrameContext>((r, e) => {

        const origin = `${window.location.protocol}//${window.location.host}`;

        const srcdoc = `

<html><body><script type="module">

    const scriptBlob = new Blob([${JSON.stringify(script)}], { type: 'text/javascript' });
    const scriptUrl = URL.createObjectURL(scriptBlob);

    (async () => {

        const script = await import(scriptUrl);

        if (!script.default) { throw new Error('default not found'); }
        const instance = new script.default();
        if (!instance.nextFrame) { throw new Error('nextFrame not found'); }

        window.addEventListener('message', e => { 
            if(e.origin !== '${origin}') { return; }
            if(e.data.type === 'nextFrame') {
                const frame = instance.nextFrame();
                window.parent.postMessage({
                    messageId: e.data.messageId,
                    response: frame
                }, '${origin}');
            } else {
                console.warn('Received unknown message type from parent - ' + e.data.type);
            }
        });
        window.parent.postMessage('Initialized', '${origin}');

    })();
 
<\/script><\/body><\/html>

        `;

        let messageId = 0;

        const iframe = document.createElement('iframe');
        iframe.srcdoc = srcdoc;
        iframe.sandbox.add('allow-scripts');
        iframe.style.display = 'none';

        const awaitingResponse: Record<number, { resolve: (...args: any[]) => void, reject: () => void }> = {};

        const frameContext: IFrameContext = {
            nextFrame: () => {
                return new Promise<Frame>((resolve, reject) => {
                    awaitingResponse[messageId] = { resolve, reject };

                    iframe.contentWindow!.postMessage({
                        messageId,
                        type: 'nextFrame'
                    }, '*');

                    messageId++;
                });
            }
        };

        const onMessage = (evt: MessageEvent) => {
            if (evt.origin !== 'null') { return; }

            if (evt.data === 'Initialized') {
                console.log('IFrame initialized');
                r(frameContext);
                return;
            }

            const messageId = evt.data.messageId;
            if (messageId === undefined) {
                console.warn('Message from iframe did not have messageId', evt);
                return;
            }

            const prom = awaitingResponse[messageId];
            if (!prom) {
                console.warn(`messageId ${messageId} not found`, evt);
                return;
            }

            prom.resolve(evt.data.response);
            delete awaitingResponse[messageId];

        }

        window.addEventListener('message', onMessage);

        document.body.appendChild(iframe);

    });

}

export interface IFrameContext {
    nextFrame(): Promise<Frame>;
}