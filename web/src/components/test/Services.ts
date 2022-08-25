
export class Timer {

    public createInterval(interval: number) {

        let now = Date.now();
        let next: Promise<number> | null = null;
        let tickNum = 0;
        const run = () => {
            next = new Promise<number>(resolve => {
                const drift = Date.now() - now;
                now = Date.now();
                setTimeout(() => {
                    run();
                    resolve(++tickNum);
                }, interval - drift);
            });
        };
        run();

        return {
            nextTick() {
                return next;
            },
            stop: () => { /* do nothing */ }
        };

    }

}