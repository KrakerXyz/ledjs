import { LedArray } from './LedArray';
import { Timer, TimerInterval } from './Services';

export class Script implements IAnimationScript {

    public constructor(private readonly _arr: LedArray, private readonly _timer: Timer) {
    }

    private _interval: TimerInterval | null = null;
    private _running = false;
    public async run(): Promise<void> {
        this._running = true;
        this._interval = this._timer.createInterval(100, this.nextFrame.bind(this), { started: true });
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

    public pause() {
        this._interval?.stop();
        this._running = false;
    }

    public resume() {
        this._running = true;
        this._interval?.start();
    }

    public dispose(): Promise<void> {
        this._interval?.stop();
        this._running = false;
        return Promise.resolve();
    }

}

interface IAnimationScript {
    /** Called to temporarily pause the script with the expectation that a subsequent resume() will pick up where it left off */
    pause(): void;
    /** Resume the script after a previous pause() call */
    resume(): void;
    /** Called before unloading the script */
    dispose(): Promise<void>;
} 
