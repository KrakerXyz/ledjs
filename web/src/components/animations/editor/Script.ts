
export default netled.defineAnimation({
    services: ['timer'],
    construct(arr, { timer }) {
        let interval: netled.services.ITimerInterval | null = null;
        let running = false;

        let pos = 0;

        return {
            run: (settings) => {

                const nextFrame = async () => {
                    if (!running) {
                        return;
                    }

                    for (let i = 0; i < arr.length; i++) {
                        const thisPos = pos + (i * settings.degPerLed);
                        const h = thisPos % 360;
                        const rgb = netled.utils.color.hslToRgb(h, 100, settings.luminosity);
                        arr.setLed(i, rgb);
                    }

                    pos += settings.step;
                    if (pos === 360) {
                        pos = 0;
                    }

                    arr.send();
                };

                interval?.stop();
                running = true;
                interval = timer.createInterval(settings.speed, nextFrame.bind(this, settings), { started: true });
                nextFrame();
            },
            pause() {
                interval?.stop();
                interval = null;
                running = false;
            }
        };
    },
    config: {
        speed: {
            name: 'Speed',
            description: 'Delay in milliseconds between cycles',
            type: 'int',
            minValue: 10,
            default: 100
        },
        degPerLed: {
            name: 'Degrees / Led',
            description: 'Change in hue degrees per LED',
            type: 'decimal',
            minValue: 0.1,
            maxValue: 180,
            default: 3.6
        },
        step: {
            name: 'Step',
            description: 'The number of hue degrees to shift by on each cycle',
            type: 'decimal',
            minValue: 0.1,
            default: 1
        },
        luminosity: {
            name: 'Luminosity',
            description: 'Luminosity',
            type: 'int',
            minValue: 1,
            maxValue: 100,
            default: 50
        }
    }
});