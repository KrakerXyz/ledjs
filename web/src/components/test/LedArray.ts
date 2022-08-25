import { ARGB } from '@krakerxyz/netled-core';

export class LedArray {

    readonly #arr: Uint8ClampedArray;
    readonly #numLeds: number;
    readonly #sendCb: () => Promise<void>;

    public constructor(sab: SharedArrayBuffer, sendCb: () => Promise<void>) {
        this.#arr = new Uint8ClampedArray(sab);
        this.#numLeds = this.#arr.length / 4;
        this.#sendCb = sendCb;
    }

    public get length(): number {
        return this.#numLeds;
    }

    public getLed(index: number): ARGB;
    public getLed(index: number, component: 0 | 1 | 2 | 3): number;
    public getLed(index: number, component?: 0 | 1 | 2 | 3): ARGB | number {

        if (Math.abs(index) >= this.#numLeds) {
            throw new Error(`Index ${index} is out of bounds`);
        }

        if (component === undefined) {
            return [this.#arr[index], this.#arr[index + 1], this.#arr[index + 2], this.#arr[index + 3]];
        }
        return this.#arr[index + component];

    }

    public setLed(index: number, color: ARGB): void;
    public setLed(index: number, a: number, r: number, g: number, b: number): void;
    public setLed(index: number, component: 0 | 1 | 2 | 3, value: number): void;
    public setLed(index: number, ...args: any[]) {

        if (Math.abs(index) >= this.#numLeds) {
            throw new Error(`Index ${index} is out of bounds`);
        }

        if (args.length === 1) {
            const color = args[0];
            this.#arr[index] = color[0];
            this.#arr[index + 1] = color[1];
            this.#arr[index + 2] = color[2];
            this.#arr[index + 3] = color[3];
        } else if (args.length === 4) {
            const [a, r, g, b] = args;
            this.#arr[index] = a;
            this.#arr[index + 1] = r;
            this.#arr[index + 2] = g;
            this.#arr[index + 3] = b;
        } else if (args.length === 2) {
            const [component, value] = args;
            if (component < 0 || component > 3) {
                throw new Error(`Component ${component} is out of bounds`);
            }
            this.#arr[index + component] = value;
        } else {
            throw new Error('Invalid number of arguments');
        }
    }

    public send(): Promise<void> {
        return this.#sendCb();
    }

}