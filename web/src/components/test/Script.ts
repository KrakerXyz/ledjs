
export default class Script implements netled.IAnimationScript {

    public constructor(private readonly _arr: netled.ILedArray, private readonly _timer: netled.services.ITimer) {
    }

    private _interval: netled.services.TimerInterval | null = null;
    private _running = false;

    public async run(): Promise<void> {
        this._running = true;
        this._interval = this._timer.createInterval(100, this.nextFrame.bind(this), { started: true });
        this.nextFrame();
    }

    private _pos = 0;
    public async nextFrame() {
        if (!this._running) {
            return;
        }

        const degPerLed = 100;

        for (let i = 0; i < this._arr.length; i++) {
            const thisPos = this._pos + (i * degPerLed);
            const h = thisPos % 360;
            const rgb = netled.utils.color.hslToRgb(h, 100, 50);
            this._arr.setLed(i, rgb);
        }

        this._pos += degPerLed;
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
            type: 'number',
            minValue: 10,
            default: 100
        },
        degPerLed: {
            name: 'Degrees / Led',
            description: 'Change in Hue value for each consecutive led',
            type: 'number',
            minValue: 0.1,
            default: 1,
            maxValue: 180
        }
    }
};