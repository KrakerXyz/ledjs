

export type TimerInterval = {
    start(): void,
    stop(): void
}

export type TimerOptions = { started?: boolean }

export class Timer {

    public createInterval(interval: number, cb: () => void, options: TimerOptions): TimerInterval {

        let running: symbol | null = null;
        let next = 0;

        const run = () => {
            const thisRunSymbol = running;
            const now = Date.now();
            const drift = now - next;
            const nextInterval = interval - drift;
            next += interval;
            console.log(`Now ${now}, Expected ${next}, Drift ${drift}, Next Interval ${nextInterval}, Next ${next}`);
            setTimeout(() => {
                if (running !== thisRunSymbol) { return; }
                run();
                cb();
            }, nextInterval);
        };

        const start = () => {
            running = Symbol();
            next = Date.now();
            run();
        };

        if (options.started) {
            start();  
        }

        return {
            start: () => {
                if (running) {
                    throw new Error('Interval is already running');
                }
                running = Symbol();
                start();
            },
            stop: () => {
                if (!running) {
                    throw new Error('Interval is not running');
                }
                running = null;
            }
        };

    }

}