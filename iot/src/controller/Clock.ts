import { DeviceWsClient } from 'netled';
import { performance } from 'perf_hooks';

export class Clock {

    public constructor(readonly deviceWs: DeviceWsClient, private readonly _onTick: () => void) {

        deviceWs.on('animationSetup', setup => {
            //If the animation was cleared, we can just ignore this. The interval will run but it'll basically be a noop. Once the next animation is set, it will override if necessary
            if (!setup) { return; }
            this.setInterval(setup.interval);
        });

        deviceWs.on('animationStop', stop => {
            this.setStopped(stop.stop);
        });

    }

    private _isStopped: boolean = false;
    private _interval: number = Infinity;
    private setInterval(interval: number) {
        if (interval === this._interval) { return; }
        console.log(`Updated interval to ${interval}ms`);
        this._interval = interval;
        if (this._isStopped) { return; }
        this.tick();
    }

    private setStopped(stopped: boolean) {
        if (stopped === this._isStopped) { return; }
        this._isStopped = stopped;
        if (stopped) {
            console.log('Animator clock stopped');
        } else {
            console.log('Animator clock started');
            //Change the next to now otherwise it'll play catch up and render all frames that otherwise would have been due during the pause period.
            this._nextDue = performance.now();
            this.tick();
        }
    }

    private _clockSkew = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    private _skewPosition = 0;

    private _nextDue = performance.now();
    private tick() {
        if (this._isStopped) { return; }

        const now = performance.now();
        const offBy = now - this._nextDue;

        if (offBy > 0) {
            this._nextDue = now + this._interval - offBy;
            this._onTick();

            this._clockSkew[this._skewPosition] = Math.abs(offBy);
            this._skewPosition++;
            if (this._clockSkew.length === this._skewPosition) {
                const avg = this._clockSkew.reduce((s, c) => s + c, 0) / this._clockSkew.length;
                console.log(`Avg Skew: ${avg}`);
                this._skewPosition = 0;
            }
        }

        const dueIn = this._nextDue - now;
        if (dueIn < 10) {
            setImmediate(() => this.tick());
        } else if (dueIn < 50) {
            setTimeout(() => this.tick(), 10);
        } else {
            setTimeout(() => this.tick(), 30);
        }

    }


}