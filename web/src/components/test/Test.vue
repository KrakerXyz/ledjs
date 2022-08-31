
<template>
    <div>
        <div v-if="false">
            <LedCanvas ref="ledCanvas"></LedCanvas>
        </div>
        <div id="editor-ide-container" class="h-100 w-100 position-absolute" />
    </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { LedArray } from './LedArray';
import LedCanvas from './LedCanvas.vue';
import { useMonacoEditor } from './monacoEditor';
import { Script } from './Script';
import { Timer } from './Services';

export default defineComponent({
    components: { LedCanvas },
    setup() {
        const ledCanvas = ref<any>();

        const timer = new Timer();
        const sab = new SharedArrayBuffer(100 * 4);
        const ledArray = new LedArray(sab, () => {
            ledCanvas.value?.render(ledArray);
            return Promise.resolve();
        });

        const script = new Script(ledArray, timer);
        script.run();

        setTimeout(() => {
            script.pause();
        }, 5000);

        const { content } = useMonacoEditor(
            'editor-ide-container',
            {
                typescriptLib: {
                    'global': `

export {};

declare global {
    type TimerInterval = {
        /** Start the timer */
        start(): void;
        /** Stop the timer */
        stop(): void;
    }
    
    type TimerOptions = {
        /** Immediately start the timer. Defaults to false which requires an explicit call to start() after creating the timer */
        started?: boolean;
    }

    /** Service to creating timers and intervals */
    interface ITimer {
        /** Creates a interval that runs a callback at a specified intercal */
        createInterval(interval: number, cb: () => void, options: TimerOptions): TimerInterval;
    }

    /** Animation script interface */
    interface IAnimationScript {
        /** Called to start the animation after script instantiation as well as any time the LedArray needs to be reset or settings have changed. */
        run(arr: ILedArray, settings: Record<string, string | number | boolean>): void;
        /** Called to temporarily pause the script with the expectation that a subsequent resume() will pick up where it left off */
        pause(): void;
        /** Resume the script after a previous pause() call */
        resume(): void;
        /** Called before unloading the script */
        disposeAsync?(): Promise<void>;
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
        getLed(index: number): [number, number, number, number];
        /** Gets byte of specified color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of LED at given index */
        getLed(index: number, component: 0 | 1 | 2 | 3): number;

        /** Notifies the renderer that a new frame is ready to be drawn on the LEDs */
        send(): void;
    }
}
                    `
                }
            }
        );

        content.value = `
        
export class Script implements IAnimationScript {

    public constructor(private readonly _timer: ITimer) {
    }

    private _interval: TimerInterval | null = null;
    private _running = false;

    public run(arr: ILedArray): void {
        this._running = true;
        this._interval = this._timer.createInterval(100, this.nextFrame.bind(this, arr), { started: true });
        this.nextFrame(arr);
    }

    private _color = 0;
    private nextFrame(arr: ILedArray) {
        if (!this._running) {
            return;
        }
        this._color++;
        if (this._color === 255) {
            this._color = 0;
        }
        for (let i = 0; i < arr.length; i++) {
            if (!(i % 5)) {
                arr.setLed(i, 255, this._color, 0, 0);
            } else {
                arr.setLed(i, 255, 0, 0, 0);
            }
        }
        arr.send();
    }

    public pause() {
        this._interval?.stop();
        this._running = false;
    }

    public resume() {
        this._running = true;
        this._interval?.start();
    }

    public disposeAsync(): Promise<void> {
        this._interval?.stop();
        this._running = false;
        return Promise.resolve();
    }

}

        `;

        return { ledCanvas };
    },
});

</script>
