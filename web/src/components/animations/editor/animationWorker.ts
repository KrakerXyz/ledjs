import { hslToRgb } from '@krakerxyz/netled-core';
import { LedArray } from './LedArray';
import { Timer } from './Timer';

(self as any).netled2 = {
    utils: {
        color: {
            hslToRgb
        }
    },
    defineAnimation(animation: netled2.IAnimation): netled2.IAnimation { return animation; }
};

let ledArray: LedArray | null = null;
let timer: netled2.services.ITimer | null = null;
let settings: netled2.AnimationSettings | null = null;
let controller: netled2.AnimationController | null = null;

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

            const animation = module.default as netled2.IAnimation<string[], any>;

            if (!animation.construct) {
                postMessage({ name: 'moduleError', errors: [{ severity: 'error', line: 0, col: 0, message: 'Script has no construct function' }] });
                return;
            }

            settings = data.settings ?? null;
            if(!settings) {
                settings = {};
                
                if(animation.config) {
                    postMessage({ name: 'config', config: animation.config });

                    for(const key of Object.keys(animation.config)) {
                        (settings as any)[key] = animation.config[key].default;
                    }

                }
            }

            ledArray = new LedArray(sab, numLeds, arrayOffset, async () => postMessage({ name: 'render' }));

            const services: Partial<netled2.services.Services> = {};
            for (const service of animation.services) {
                if (service === 'timer') {
                    timer = new Timer();
                    services['timer'] = timer;
                }
            }

            controller = animation.construct(ledArray, services);

            controller.run(settings);

            break;

        }
        case 'update-settings': {
            settings = data.settings;

            if(!settings) {
                throw new Error('No settings provided');
            }

            if(controller) {
                controller.run(settings);
            }

            break;
        }
        default: throw new Error(`Unknown message: ${data.name}`);
    }
};