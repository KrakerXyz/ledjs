
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
        start(): void;
        stop(): void;
    }
    type TimerOptions = {
        started?: boolean;
    }
    interface ITimer {
        createInterval(interval: number, cb: () => void, options: TimerOptions): TimerInterval;
    }

    /** Animation script interface */
    interface IAnimationScript {
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
        getLed(index: number): ARGB;
        /** Gets byte of specified color component (0: Alpha, 1: Red, 2: Green, 3: Blue) of LED at given index */
        getLed(index: number, component: 0 | 1 | 2 | 3): number;
    }

    /** Linting for IAnimationScript constructor. Options and can be removed **/
    function AnimationScript(ctor: { new(arr: ILedArray, ...args: (Timer)[]): IAnimationScript })
}
                    `
                }
            }
        );

        content.value = `
        
@AnimationScript
export class Script implements IAnimationScript {

    public constructor(private readonly _arr: ILedArray, private readonly _timer: ITimer) {

    }

    public pause(): void {
        throw new Error('Method not implemented');
    }

    public resume(): void {
        throw new Error('Method not implemented');
    }

    public disposeAsync(): Promise<void> {
        // This method is optional and can be deleted
        throw new Error('Method not implemented');
    }

}

        `;

        return { ledCanvas };
    },
});

</script>
