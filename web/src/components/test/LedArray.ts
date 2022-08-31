import { ARGB } from '@krakerxyz/netled-core';

export class LedArray implements ILedArray {

    readonly #arr: Uint8ClampedArray;
    readonly #numLeds: number;
    readonly #sendCb: () => Promise<void>;

    public constructor(sab: SharedArrayBuffer, sendCb: () => Promise<void>) {
        this.#arr = new Uint8ClampedArray(sab);
        this.#numLeds = this.#arr.length / 4;
        this.#sendCb = sendCb;
    }

    /** The number of leds in the array */
    public get length(): number {
        return this.#numLeds;
    }

    public getLed(index: number): ARGB;
    public getLed(index: number, component: 0 | 1 | 2 | 3): number;
    public getLed(index: number, component?: 0 | 1 | 2 | 3): ARGB | number {

        if (Math.abs(index) >= this.#numLeds) {
            throw new Error(`Index ${index} is out of bounds`);
        }

        const pos = index * 4;
        if (component === undefined) {
            const led: ARGB = [this.#arr[pos], this.#arr[pos + 1], this.#arr[pos + 2], this.#arr[pos + 3]];
            return led;
        }

        return this.#arr[pos + component];

    }

    public setLed(index: number, color: ARGB): void;
    public setLed(index: number, a: number, r: number, g: number, b: number): void;
    public setLed(index: number, component: 0 | 1 | 2 | 3, value: number): void;
    public setLed(index: number, ...args: any[]) {

        if (Math.abs(index) >= this.#numLeds) {
            throw new Error(`Index ${index} is out of bounds`);
        }

        const pos = index * 4;
        if (args.length === 1) {
            const color = args[0];
            this.#arr[pos] = color[0];
            this.#arr[pos + 1] = color[1];
            this.#arr[pos + 2] = color[2];
            this.#arr[pos + 3] = color[3];
        } else if (args.length === 4) {
            const [a, r, g, b] = args;
            this.#arr[pos] = a;
            this.#arr[pos + 1] = r;
            this.#arr[pos + 2] = g;
            this.#arr[pos + 3] = b;
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

    public send(): Promise<void> {
        return this.#sendCb();
    }

}

/** Method for assigning color values to LEDs in an array */
interface ILedArray {
    /** The number of LEDs in the array */
    readonly length: number;

    /** Set LED at specified index using a four-element array representing [Alpha, Red, Green, Blue] bytes */
    setLed(index: number, argb: [number, number, number, number]): void;
    /** Set LED at specified index to Alpha, Red, Green, Blue byte values */
    setLed(index: number, a: number, r: number, g: number, b: number): void;
    /** Set color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of specified LED to given byte */
    setLed(index: number, component: 0 | 1 | 2 | 3, value: number): void;

    /** Gets current color values of LED at specified index returns as a four-element array of bytes representing [Alpha, Red, Green, Blue]  */
    getLed(index: number): ARGB;
    /** Gets byte of specified color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of LED at given index */
    getLed(index: number, component: 0 | 1 | 2 | 3): number;
}