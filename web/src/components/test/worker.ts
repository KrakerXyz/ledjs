import { hslToRgb } from '@krakerxyz/netled-core';
import { LedArray } from './LedArray';
import { Timer } from './Timer';

(self as any).netled = {
    utils: {
        color: {
            hslToRgb
        }
    }
};

onmessage = async (e: any) => {
    const data = e.data;
    console.log('Incoming message', data);
    if(!data) {
        throw new Error('Message did not have data');
    }
    switch(data.name) {
        case 'init': {
            const sab: SharedArrayBuffer = data.sab;
            const js: string = data.js;
            const numLeds: number = data.numLeds;
            const arrayOffset: number = data.arrayOffset;

            const b64moduleData = 'data:text/javascript;base64,' + btoa(js);
            const module = await import(/* @vite-ignore */ b64moduleData);

            if (!module.default) {
                postMessage({ name: 'moduleError', errors: [{ severity: 'error', line: 0, col: 0, message: 'Script has not default export' }] });
                return;
            }

            if (!module.default.prototype.constructor) {
                postMessage({ name: 'moduleError', errors: [{ severity: 'error', line: 0, col: 0, message: 'Script has no constructor' }] });
                return;
            }

            const settings: netled.IAnimationConfigValues<any> = {};

            if(module.config) {
                postMessage({ name: 'config', config: module.config });

                for(const key of Object.keys(module.config.fields)) {
                    (settings as any)[key] = module.config.fields[key].default;
                }

            }

            const ledArray = new LedArray(sab, numLeds, arrayOffset, async () => postMessage({ name: 'render' }));

            const newTimer = new Timer();

            const newInst = new module.default(ledArray, newTimer) as netled.IAnimationScript;
            newInst.run(settings);

            break;

        }
        default: throw new Error(`Unknown message: ${data.name}`);
    }
};