import { Config, ConfigMeta, Frame, hslToRgb, rgbToHex, rotateFrame } from 'netled';

export function useIframeRunner(script: string): Promise<IFrameContext> {

    return new Promise<IFrameContext>(r => {

        const origin = `${window.location.protocol}//${window.location.host}`;

        const srcdoc = `

<html><body><script type="module">

    const scriptBlob = new Blob([${JSON.stringify(script)}], { type: 'text/javascript' });
    const scriptUrl = URL.createObjectURL(scriptBlob);

    (async () => {

        window.netled = {
            util: {
                color: {
                    hslToRgb: ${hslToRgb},
                    rgbToHex: ${rgbToHex}
                },
                frame: {
                    rotateFrame: ${rotateFrame}
                }
            }
        };

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
            } else if(e.data.type === 'setNumLeds') {
                instance.setNumLeds(e.data.numLeds);
                console.log('IFrame: setNumLeds(' + e.data.numLeds + ')');
            } else if(e.data.type === 'getConfigMeta') {
                const meta = script.default.configMeta;
                console.log('IFrame: got configMeta', meta);
                window.parent.postMessage({
                    messageId: e.data.messageId,
                    response: meta ?? {}
                }, '${origin}');
            } else if(e.data.type === 'setConfig') {
                instance.setConfig(e.data.config);
                console.log('IFrame: setConfig(' + JSON.stringify(e.data.config) + ')');
                window.parent.postMessage({
                    messageId: e.data.messageId
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

        let disposed = false;
        const frameContext: IFrameContext = {
            nextFrame: () => {
                if (disposed) { throw new Error('iframe has been disposed'); }
                return new Promise<Frame>((resolve, reject) => {
                    awaitingResponse[messageId] = { resolve, reject };

                    iframe.contentWindow!.postMessage({
                        messageId,
                        type: 'nextFrame'
                    }, '*');

                    messageId++;
                });
            },
            setNumLeds(numLeds) {
                if (disposed) { throw new Error('iframe has been disposed'); }
                iframe.contentWindow!.postMessage({
                    type: 'setNumLeds',
                    numLeds
                }, '*');
            },
            getConfigMeta: () => {
                if (disposed) { throw new Error('iframe has been disposed'); }

                return new Promise<ConfigMeta>((resolve, reject) => {
                    awaitingResponse[messageId] = { resolve, reject };

                    iframe.contentWindow!.postMessage({
                        type: 'getConfigMeta',
                        messageId,
                    }, '*');

                    messageId++;
                });
            },
            setConfig: (config) => {
                if (disposed) { throw new Error('iframe has been disposed'); }

                return new Promise<void>((resolve, reject) => {
                    awaitingResponse[messageId] = { resolve, reject };

                    iframe.contentWindow!.postMessage({
                        type: 'setConfig',
                        messageId,
                        config
                    }, '*');

                    messageId++;
                });
            },
            dispose: () => {
                if (disposed) { throw new Error('iframe has been disposed'); }
                iframe.remove();
                disposed = true;
                window.removeEventListener('message', onMessage);
            }
        }

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

            if (evt.data.response) {
                prom.resolve(evt.data.response);
            } else {
                prom.resolve();
            }
            delete awaitingResponse[messageId];

        }

        window.addEventListener('message', onMessage);

        document.body.appendChild(iframe);

    });

}

export interface IFrameContext {
    setNumLeds(numLeds: number): void;
    nextFrame(): Promise<Frame>;
    getConfigMeta(): Promise<ConfigMeta>;
    setConfig(config: Config<any>): Promise<void>;
    dispose(): void;
}