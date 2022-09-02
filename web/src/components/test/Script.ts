
export default class Script implements netled.IAnimationScript {

    public constructor(private readonly _arr: netled.ILedArray, private readonly _timer: netled.services.ITimer) {

        const space = 360 / _arr.length;
        for (let i = 0; i < _arr.length; i++) {
            const h = i * space;
            const rgb = this.hslToRgb(h, 100 ,50);
            _arr.setLed(i, rgb);
        }

    }

    private _interval: netled.services.TimerInterval | null = null;
    private _running = false;

    public async run(): Promise<void> {
        this._running = true;
        this._interval = this._timer.createInterval(250, this.nextFrame.bind(this), { started: true });
        this.nextFrame();
    }

    public async nextFrame() {
        if (!this._running) {
            return;
        }

        this._arr.shift();
        this._arr.send();
    }

    public pause() {
        this._interval?.stop();
        this._running = false;
    }

    private hslToRgb(h: number, s: number, l: number): [number, number, number, number] {
    // Must be fractions of 1
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return [255, r, g, b];
    }

}
