import { LedArray } from './LedArray';
import { Timer } from './Services';

export class Script {

    public constructor(private readonly _arr: LedArray, private readonly _timer: Timer) {
    }

    public async run(): Promise<void> {
        const interval = this._timer.createInterval(1000);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await interval.nextTick();
            for (let i = 0; i < this._arr.length; i++) {
                this._arr.setLed(i, [0, 0, 0, 0]);
            }
            await this._arr.send();
        }
    }

}