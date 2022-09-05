
export default class Script implements netled.IAnimationScript {

    public constructor(private readonly _arr: netled.ILedArray, private readonly _timer: netled.services.ITimer) {
    }

    private _interval: netled.services.TimerInterval | null = null;
    private _running = false;

    public async run(settings: netled.IAnimationConfigValues<typeof config>): Promise<void> {
        this._running = true;
        this._interval = this._timer.createInterval(settings.speed, this.nextFrame.bind(this, settings), { started: true });
        this.nextFrame(settings);
    }

    private _pos = 0;
    public async nextFrame(settings: netled.IAnimationConfigValues<typeof config>) {
        if (!this._running) {
            return;
        }

        for (let i = 0; i < this._arr.length; i++) {
            const thisPos = this._pos + (i * settings.degPerLed);
            const h = thisPos % 360;
            const rgb = netled.utils.color.hslToRgb(h, 100, settings.luminosity);
            this._arr.setLed(i, rgb);
        }

        this._pos += settings.step;
        if (this._pos === 360) {
            this._pos = 0;
        }

        this._arr.send();
    }

    public pause() {
        this._interval?.stop();
        this._running = false;
    }

}

export const config: netled.IAnimationConfig = {
    fields: {
        speed: {
            name: 'Speed',
            description: 'Delay in milliseconds between cycles',
            type: 'int',
            minValue: 10,
            default: 100
        },
        degPerLed: {
            name: 'Degrees / Led',
            description: 'Change in Hue value for each consecutive led',
            type: 'decimal',
            minValue: 0.1,
            maxValue: 180,
            default: 3.6
        },
        step: {
            name: 'Step',
            description: 'The number of pixels to shift by on each cycle',
            type: 'decimal',
            minValue: 0.1,
            default: 1
        },
        luminosity: {
            name: 'Luminosity',
            description: 'The luminosity of each color',
            type: 'int',
            minValue: 1,
            maxValue: 100,
            default: 10
        }
    }
};