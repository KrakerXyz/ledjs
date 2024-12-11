import { deepFreeze } from './rest/RestClient.js';

export type LedSegmentCallback = (ledSegment: LedSegment) => Promise<void>;

export class LedSegment implements netled.common.ILedSegment, Disposable {

    readonly #arr: Uint8ClampedArray;
    readonly #numLeds: number;
    public readonly deadLeds: number[];
    public readonly sab: SharedArrayBuffer;
    #disposed = false;

    public constructor(numLeds: number, deadLeds: (number | `${number}-${number}`)[] = [], sab?: SharedArrayBuffer) {
        this.sab = sab ?? new SharedArrayBuffer(numLeds * 4);
        this.#arr = new Uint8ClampedArray(this.sab);
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
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }
        this.#rawSegment ??= this.deadLeds.length ? new LedSegment(this.#numLeds, undefined, this.sab) : this;
        return this.#rawSegment;
    }

    /** The number of writeable leds in the array */
    public get length(): number {
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }
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
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }

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
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }

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

    public blackOut(): void {
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }
        this.#arr.fill(0);
    }

    public copyTo(segment: netled.common.ILedSegment, offset: number): void {
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }
        if (offset < 0 || offset >= this.#numLeds) {
            throw new Error(`Offset ${offset} is out of bounds`);
        }

        const raw = this.rawSegment;
        for (let i = 0; i < raw.length; i++) {
            const rawLed = raw.getLed(i);
            segment.setLed(i + offset, rawLed);
        }
    }
    
    readonly #sendCb: LedSegmentCallback[] = [];
    public addSendCallback(cb: LedSegmentCallback): void {
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }
        if (this.#sendCb.includes(cb)) { throw new Error('Callback already added'); }
        this.#sendCb.push(cb);
        cb(this);
    }

    public removeSendCallback(cb: LedSegmentCallback): void {
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }
        const index = this.#sendCb.indexOf(cb);
        if (index === -1) { throw new Error('Callback not found'); }
        this.#sendCb.splice(index, 1);
    }

    #isSending = false;
    public send = (): Promise<void> => {
        if (this.#disposed) { throw new Error('LedSegment is disposed'); }
        if (this.#sendCb.length === 0) { return Promise.resolve(); }
        if (this.#isSending) {
            console.warn('Previous send still in progress. Skipping frame');
            return Promise.resolve();
        }
        this.#isSending = true;
        const proms = this.#sendCb.map(cb => cb(this));
        return Promise.all(proms).finally(() => this.#isSending = false) as Promise<unknown> as Promise<void>;
    }

    [Symbol.dispose](): void {
        if (this.#disposed) { return; }
        this.#disposed = true;
        this.#rawSegment?.[Symbol.dispose]();
        this.#sendCb.length = 0;
    }

}