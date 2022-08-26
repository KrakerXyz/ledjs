import { LedArray } from './LedArray';
import { Timer, TimerInterval } from './Services';

export class Script {

    public constructor(private readonly _arr: LedArray, private readonly _timer: Timer) {
    }

    private _interval: TimerInterval | null = null;
    private _running = false;
    public async run(): Promise<void> {
        this._running = true;
        this._interval = this._timer.createInterval(20, this.nextFrame.bind(this), { started: true });
        this.nextFrame();
    }

    private _color = 0;
    public async nextFrame() {
        if (!this._running) {
            return;
        }
        this._color++;
        if (this._color === 255) {
            this._color = 0;
        }
        for (let i = 0; i < this._arr.length; i++) {
            if (!(i % 5)) {
                this._arr.setLed(i, 255, this._color, 0, 0);
            } else {
                this._arr.setLed(i, 255, 0, 0, 0);
            }
        }
        await this._arr.send();
    }

    public async pause() {
        this._interval?.stop();
        this._running = false;
    }

    public dispose(): void {
        this._interval?.stop();
        this._running = false;
    }

}