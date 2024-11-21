import { deepFreeze } from './rest/RestClient.js';

export type LedSegmentCallback = (ledSegment: LedSegment) => Promise<void>;

export class LedSegment implements netled.common.ILedSegment {

    readonly #arr: Uint8ClampedArray;
    readonly #numLeds: number;
    public readonly deadLeds: number[];

    public constructor(public readonly sab: SharedArrayBuffer, numLeds: number, public readonly ledOffset: number, deadLeds: (number | `${number}-${number}`)[] = []) {
        this.#arr = new Uint8ClampedArray(sab, ledOffset * 4, numLeds * 4);
        this.#numLeds = numLeds;

        this.deadLeds = [];
        for (const deadLed of deadLeds) {
            if (typeof deadLed === 'number') {
                this.deadLeds.push(deadLed);
            } else {
                const [start, end] = deadLed.split('-').map(Number);
                for (let i = start; i <= end; i++) {
                    this.deadLeds.push(i);
                }
            }
        }
        this.deadLeds.sort((a, b) => a - b);
        deepFreeze(this.deadLeds);
    }

    #rawSegment: LedSegment | null = null;
    public get rawSegment(): netled.common.ILedSegment {
        this.#rawSegment ??= this.deadLeds.length ? new LedSegment(this.sab, this.#numLeds, this.ledOffset) : this;
        return this.#rawSegment;
    }

    /** The number of writeable leds in the array */
    public get length(): number {
        return this.#numLeds - this.deadLeds.length;
    }

    private deadOffset(index: number): number {
        let offset = 0;
        for (const deadLed of this.deadLeds) {
            if (deadLed > index + offset) {
                break
            }
            offset++;
        }
        return offset;
    };

    public getLed(index: number): netled.common.IArgb;
    public getLed(index: number, component: 0 | 1 | 2 | 3): number;
    public getLed(index: number, component?: 0 | 1 | 2 | 3): netled.common.IArgb | number {

        if (Math.abs(index) >= this.length) {
            throw new Error(`Index ${index} is out of bounds`);
        }

        index += this.deadOffset(index);

        const pos = index * 4;

        if (component === undefined) {
            const led: netled.common.IArgb = [this.#arr[pos], this.#arr[pos + 1], this.#arr[pos + 2], this.#arr[pos + 3]];
            return led;
        }

        return this.#arr[pos + component];

    }

    public setLed(index: number, color: netled.common.IArgb): void;
    public setLed(index: number, a: number, r: number, g: number, b: number): void;
    public setLed(index: number, component: 0 | 1 | 2 | 3, value: number): void;
    public setLed(index: number, ...args: any[]) {

        if (Math.abs(index) >= this.length) {
            throw new Error(`Index ${index} is out of bounds`);
        }

        index += this.deadOffset(index);

        const pos = index * 4;
        if (args.length === 1) {
            const color = args[0];
            this.#arr.set(color, pos);
        } else if (args.length === 4) {
            this.#arr.set(args, pos);
        } else if (args.length === 2) {
            const [component, value] = args;
            if (component < 0 || component > 3) {
                throw new Error(`Component ${component} is out of bounds`);
            }
            this.#arr[pos + component] = value;
        } else {
            throw new Error('Invalid number of arguments');
        }
    }

    /** Shift LEDs to the right */
    public shift(dir?: 1 | true): void;
    /** shift LEDs to the left */
    public shift(dir: 0 | false): void;
    public shift(dir?: 0 | 1 | boolean): void {
        if (this.deadLeds.length) { throw new Error('Shifting not implemented with dead leds'); }
        
        if (dir === undefined || dir) {
            let iter = 4;
            while (iter--) {
                const endByte = this.#arr.at(-1);
                for (let i = this.#arr.length - 2; i > -1; i--) {
                    this.#arr[i + 1] = this.#arr[i];
                }
                this.#arr[0] = endByte!;
            }
        } else {
            let iter = 4;
            while (iter--) {
                const startByte = this.#arr[0];
                for (let i = 0; i < this.#arr.length - 1; i++) {
                    this.#arr[i] = this.#arr[i + 1];
                }
                this.#arr[this.#arr.length - 1] = startByte;
            }
        }
    } 

    /** Reverses the order of all leds in the array */
    public reverse(): void {
        if (this.deadLeds.length) { throw new Error('Shifting not implemented with dead leds'); }
        
        for (let i = 0; i < this.#numLeds/ 2; i++) {
            const endPos = this.#numLeds - i - 1;

            const startLed = this.getLed(i);
            const endLed = this.getLed(endPos);

            this.setLed(i, endLed);
            this.setLed(endPos, startLed);
        }
    }

    
    readonly #sendCb: LedSegmentCallback[] = [];
    public addSendCallback(cb: LedSegmentCallback): void {
        if (this.#sendCb.includes(cb)) { throw new Error('Callback already added'); }
        this.#sendCb.push(cb);
    }

    public removeSendCallback(cb: LedSegmentCallback): void {
        const index = this.#sendCb.indexOf(cb);
        if (index === -1) { throw new Error('Callback not found'); }
        this.#sendCb.splice(index, 1);
    }

    #isSending = false;
    public send = (): Promise<void> => {
        if (this.#sendCb.length === 0) { return Promise.resolve(); }
        if (this.#isSending) { throw new Error('Previous send still in progress'); }
        this.#isSending = true;
        const proms = this.#sendCb.map(cb => cb(this));
        return Promise.all(proms).finally(() => this.#isSending = false) as Promise<unknown> as Promise<void>;
    }

}