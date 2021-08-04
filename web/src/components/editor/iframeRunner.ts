import { ConfigMeta, Frame, hslToRgb, rgbToHex, rotateFrame, shade } from 'netled';

export function useIframeRunner(script: string): Promise<IFrameContext> {

    return new Promise<IFrameContext>((r, rej) => {

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
                    rgbToHex: ${rgbToHex},
                    shade: ${shade}
                },
                frame: {
                    rotateFrame: ${rotateFrame}
                }
            }
        };

        let instance = null;
        let script = null;

        try {
            script = await import(scriptUrl);

            if (!script.default) { throw new Error('default not found'); }
            instance = new script.default();
            if (!instance.nextFrame) { throw new Error('nextFrame not found'); }

        } catch(e) {
            window.parent.postMessage({
                type: 'initializationError',
                error: e
            }, '${origin}');
            return;
        }

        window.addEventListener('message', e => {
            try {
                if(e.origin !== '${origin}') { return; }

                if(e.data.type === 'nextFrame') {
                    const frame = instance.nextFrame();
                    window.parent.postMessage({
                        messageId: e.data.messageId,
                        response: frame
                    }, '${origin}');

                } else if(e.data.type === 'setNumLeds') {
                    instance.setNumLeds(e.data.numLeds);
                    console.debug('IFrame: setNumLeds(' + e.data.numLeds + ')');
                    window.parent.postMessage({
                        messageId: e.data.messageId
                    }, '${origin}');

                } else if(e.data.type === 'getConfigMeta') {
                    const meta = script.default.configMeta;
                    console.debug('IFrame: got configMeta', meta);
                    window.parent.postMessage({
                        messageId: e.data.messageId,
                        response: meta ?? {}
                    }, '${origin}');

                } else if(e.data.type === 'setConfig') {
                    instance.setConfig(e.data.config);
                    console.debug('IFrame: setConfig(' + JSON.stringify(e.data.config) + ')');
                    window.parent.postMessage({
                        messageId: e.data.messageId
                    }, '${origin}');

                } else {
                    console.warn('Received unknown message type from parent - ' + e.data.type);

                }
            } catch(err) {
                window.parent.postMessage({
                    messageId: e.data.messageId,
                    srcData: e.data,
                    error: err
                }, '${origin}');
            }
        });

        console.debug('IFrame: posting Initialized');
        window.parent.postMessage({type:'initialized'}, '${origin}');

    })();
 
</script></body></html>

        `;

        let messageId = 0;

        const iframe = document.createElement('iframe');
        iframe.srcdoc = srcdoc;
        iframe.sandbox.add('allow-scripts');
        iframe.style.display = 'none';

        const awaitingResponse: Record<number, { resolve: (...args: any[]) => void, reject: (...args: any[]) => void }> = {};

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
            setNumLeds: (numLeds) => {
                if (disposed) { throw new Error('iframe has been disposed'); }

                return new Promise<void>((resolve, reject) => {
                    awaitingResponse[messageId] = { resolve, reject };

                    iframe.contentWindow!.postMessage({
                        messageId,
                        type: 'setNumLeds',
                        numLeds
                    }, '*');

                    messageId++;
                });

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
        };

        const onMessage = (evt: MessageEvent) => {
            if (evt.origin !== 'null') { return; }

            if (evt.data.type === 'initialized') {
                console.debug('IFrame initialized');
                r(frameContext);
                return;
            }

            if (evt.data.type === 'initializationError') {
                rej(evt.data.error);
                return;
            }

            const messageId = evt.data.messageId;
            const prom = awaitingResponse[messageId];

            if (evt.data.error) {
                if (prom) {
                    prom.reject(evt.data.error);
                } else {
                    console.error('Got error from IFrame');
                }
                return;
            }

            if (messageId === undefined) {
                console.warn('Message from iframe did not have messageId', evt);
                return;
            }

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

        };

        window.addEventListener('message', onMessage);

        console.debug('Inserting iframe');
        document.body.appendChild(iframe);

    });

}

export interface IFrameContext {
    setNumLeds(numLeds: number): Promise<void>;
    nextFrame(): Promise<Frame>;
    getConfigMeta(): Promise<ConfigMeta>;
    setConfig(config: Record<string, any>): Promise<void>;
    dispose(): void;
}