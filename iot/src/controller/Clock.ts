import { DeviceWsClient } from 'netled';
import { performance } from 'perf_hooks';

export class Clock {

    public constructor(readonly deviceWs: DeviceWsClient, private readonly _onTick: () => void) {

        deviceWs.onAnimationSetup(setup => {
            this.setInterval(setup.interval);
        });

        deviceWs.onAnimationStop(stop => {
            this.setStopped(stop.stop);
        });

    }

    private _isStopped: boolean = false;
    private _interval: number = Infinity;
    private _intervalTimeout: NodeJS.Timeout | null = null;
    private setInterval(interval: number) {
        if (interval === this._interval) { return; }
        console.log(`Updated interval to ${interval}ms`);
        this._interval = interval;
        if (this._intervalTimeout) { clearInterval(this._intervalTimeout); }
        if (this._isStopped) { return; }
        this._intervalTimeout = setInterval(() => this.tick(), 5);
    }

    private setStopped(stopped: boolean) {
        if (stopped === this._isStopped) { return; }
        this._isStopped = stopped;
        if (stopped) {
            console.log('Animator clock stopped');
            if (this._intervalTimeout) {
                clearInterval(this._intervalTimeout);
                this._intervalTimeout = null;
            }
        } else if (!this._intervalTimeout) {
            console.log('Animator clock started');
            //Change the next to now otherwise it'll play catch up and render all frames that otherwise would have been due during the pause period.
            this._nextDue = performance.now();
            this._intervalTimeout = setInterval(() => this.tick(), 5);
        }
    }

    private _nextDue = performance.now();
    private tick() {
        if (this._isStopped) { return; }
        const now = performance.now();
        const offBy = now - this._nextDue;
        if (offBy < -2) { return; }
        //console.log(`Late: ${offBy}`);
        this._nextDue = now + this._interval - offBy;
        this._onTick();
    }


}