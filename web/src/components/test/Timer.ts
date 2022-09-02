

export type TimerInterval = {
    start(): void,
    stop(): void
}

export type TimerOptions = { started?: boolean }

export class Timer {

    #disposed = false;
    #running: symbol | null = null;

    public createInterval(interval: number, cb: () => void, options: TimerOptions): TimerInterval {
        let next = 0;

        //const weakCb = new WeakRef(cb);
        const weakCb = { deref: () => cb };

        const run = () => {
            const thisRunSymbol = this.#running;
            const now = Date.now();
            const drift = now - next;
            const nextInterval = interval - drift;
            next += interval;
            //console.log(`Now ${now}, Expected ${next}, Drift ${drift}, Next Interval ${nextInterval}, Next ${next}`);
            setTimeout(() => {
                if (this.#running !== thisRunSymbol) { return; }
                const thisCb = weakCb.deref();
                if (!thisCb) {
                    return;
                }
                run();
                thisCb();
            }, nextInterval);
        };

        const start = () => {
            if (this.#disposed) {
                throw new Error('Timer has been disposed');

            }

            if (!weakCb.deref) {
                throw new Error('callback as been gc\'d');
            }

            this.#running = Symbol();
            next = Date.now();
            run();
        };

        if (options.started) {
            start();  
        }

        return {
            start: () => {
                if (this.#running) {
                    throw new Error('Interval is already running');
                }

                if (!weakCb.deref()) {
                    throw new Error('Callback has been garbage collected');
                }

                this.#running = Symbol();
                start();
            },
            stop: () => {
                if (!this.#running) {
                    throw new Error('Interval is not running');
                }
                this.#running = null;
            }
        };

    }

    public dispose() {
        this.#running = null;
        this.#disposed = true;
    }

}