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

let ledArray: LedArray | null = null;
let instance: netled.IAnimationScript | null = null;
let settings: netled.IAnimationConfigValues<any> | null = null;
let timer: netled.services.ITimer | null = null;

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

            settings = data.settings ?? null;
            if(!settings) {
                settings = {};
                
                if(module.config) {
                    postMessage({ name: 'config', config: module.config });

                    for(const key of Object.keys(module.config.fields)) {
                        (settings as any)[key] = module.config.fields[key].default;
                    }

                }
            }

            ledArray = new LedArray(sab, numLeds, arrayOffset, async () => postMessage({ name: 'render' }));

            timer = new Timer();

            instance = new module.default(ledArray, timer) as netled.IAnimationScript;
            instance.run(settings);

            break;

        }
        case 'update-settings': {
            settings = data.settings;

            if(!settings) {
                throw new Error('No settings provided');
            }

            if(instance) {
                instance.run(settings);
            }

            break;
        }
        default: throw new Error(`Unknown message: ${data.name}`);
    }
};