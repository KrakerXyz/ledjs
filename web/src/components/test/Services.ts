import { assertTrue } from './assertsTrue';

export type TimerInterval = {
    nextTick(): Promise<number>,
    start(): void,
    stop(): void
}

export type TimerOptions = { started?: boolean }

export class Timer {

    public createInterval(interval: number, options: TimerOptions): TimerInterval {

        let running: symbol | null = null;
        let now = Date.now();
        let next: Promise<number> | null = null;
        let tickNum = 0;

        const run = () => {
            const thisRunSymbol = running;
            next = new Promise<number>(resolve => {
                const drift = Date.now() - now;
                now = Date.now();
                setTimeout(() => {
                    if (running !== thisRunSymbol) { return; }
                    run();
                    resolve(++tickNum);
                }, interval - drift);
            });
        };

        if (options.started) {
            running = Symbol();
            run();
        }

        return {
            nextTick() {
                if (!running) { throw new Error('Interval is stopped'); }
                assertTrue(!!next);
                return next;
            },
            start: () => {
                if (running) {
                    throw new Error('Interval is already running');
                }
                running = Symbol();
                run();
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