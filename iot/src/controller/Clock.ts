import { DeviceWsClient } from 'netled';
import { performance } from 'perf_hooks';

export class Clock {

    public constructor(readonly deviceWs: DeviceWsClient, private readonly _onTick: () => void) {

        deviceWs.on('animationSetup', setup => {
            //If the animation was cleared, we can just ignore this. The interval will run but it'll basically be a noop. Once the next animation is set, it will override if necessary
            if (!setup) {
                //This will cause the loop to terminate
                this._interval = 0;
                this._tickNum++;
                return;
            }

            this.setInterval(setup.interval);
        });

        deviceWs.on('animationStop', stop => {
            this.setStopped(stop.stop);
        });

    }

    private _isStopped: boolean = false;
    private _interval: number = Infinity;
    private _tickNum: number = 0;
    private setInterval(interval: number) {
        if (interval === this._interval) { return; }
        console.log(`Updated interval to ${interval}ms`);
        this._interval = interval;
        if (this._isStopped) { return; }
        this._tickNum++;
        this.tick(this._tickNum);
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
            this._tickNum++;
            this.tick(this._tickNum);
        }
    }

    private _nextDue = performance.now();
    private tick(tickNum: number) {
        if (tickNum !== this._tickNum) { return; }
        if (this._isStopped) { return; }

        const now = performance.now();
        const offBy = now - this._nextDue;

        if (offBy > 0) {
            this._nextDue = now + this._interval - offBy;
            this._onTick();
        }

        const dueIn = this._nextDue - now;
        if (dueIn < 10) {
            setImmediate(() => this.tick(tickNum));
        } else {
            setTimeout(() => this.tick(tickNum), Math.floor(dueIn / 3));
        }

    }


}