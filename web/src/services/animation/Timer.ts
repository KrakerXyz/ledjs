
export interface TimerInterval {
    start(): void,
    stop(): void,
}

export interface TimerOptions { started?: boolean }

export class Timer {

    #disposed = false;
    #running: symbol | null = null;

    public createInterval(interval: number, cb: () => void | Promise<void>, options: TimerOptions): TimerInterval {
        let next = 0;
        let runningCb = false;
        const run = () => {
            const thisRunSymbol = this.#running;
            const now = Date.now();
            const drift = now - next;
            const nextInterval = interval - drift;
            next += interval;
            //console.log(`Now ${now}, Expected ${next}, Drift ${drift}, Next Interval ${nextInterval}, Next ${next}`);
            setTimeout(() => {
                if (this.#running !== thisRunSymbol) { return; }
                run();
                if (runningCb) {
                    console.warn('Last timer callback still running. Skipping current tick.');
                    return;
                }
                runningCb = true;
                const now = performance.now();
                const cbResult = cb();
                Promise.resolve(cbResult).then(() => {
                    const elapsed = performance.now() - now;
                    if(elapsed> interval) {
                        console.warn(`Callback took longer than interval - ${elapsed}ms`);
                    }
                    runningCb = false;
                });
            }, nextInterval);
        };

        const start = () => {
            if (this.#disposed) {
                throw new Error('Timer has been disposed');
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