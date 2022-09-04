
<template>
    <div class="d-flex flex-column h-100">
        <LedCanvas class="led-canvas" ref="ledCanvas"></LedCanvas>
        <div class="flex-grow-1 row g-0">
            <div class="col">
                <div class="h-100 d-flex flex-column">
                    <div class="flex-grow-1 position-relative">
                        <div id="editor-ide-container" class="h-100 w-100 position-absolute" />
                    </div>
        
                    <div v-if="issues.length" class="ide-errors bg-dark">
                        <ul class="list-group font-monospace text-white">
                            <li v-for="(i, $index) of issues" :key="$index" class="p-1">
                                <span v-if="i.severity === 'warning'" class="text-warning"><i class="fa-solid fa-lg fa-fw fa-exclamation-triangle"></i></span>
                                <span v-else class="text-danger"><i class="fa-solid fa-lg fa-fw fa-bomb"></i></span>
                                {{i.message}} [{{ i.line }}, {{ i.col }}]
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 p-2">
                <h3>Device</h3>
                <div class="form-floating">
                    <input
                        id="d-leds"
                        class="form-control"
                        placeholder="*"
                    >
                    <label for="d-leds"># LEDs</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, ref, watch } from 'vue';
import { LedArray } from './LedArray';
import LedCanvas from './LedCanvas.vue';
import { CodeIssue, useMonacoEditor } from './monacoEditor';
import { Timer } from './Timer';
import types from './types.d.ts?raw';
import example from './Script.ts?raw';
import { hslToRgb } from '@krakerxyz/netled-core';
import { computed } from '@vue/reactivity';

export default defineComponent({
    components: { LedCanvas },
    setup() {

        (window as any).netled = {
            utils: {
                color: {
                    hslToRgb
                }
            }
        };

        const ledCanvas = ref<any>();

        const numLeds = 100;
        const sab = new SharedArrayBuffer(numLeds * 4);
        const fullArray = new LedArray(sab, numLeds, 0, () => Promise.resolve());
        const ledArray = new LedArray(sab, 100, 0, () => {
            ledCanvas.value?.render(fullArray);
            return Promise.resolve();
        });

        const { content, issues, javascript } = useMonacoEditor(
            'editor-ide-container',
            {
                typescriptLib: {
                    'global': types
                }
            }
        );

        content.value = example;

        // eslint-disable-next-line no-undef
        let timer: Timer | null = null;

        const moduleIssues = ref<CodeIssue[]>([]);
        
        // eslint-disable-next-line no-undef
        let inst: netled.IAnimationScript | null = null;

        watch(javascript, async js => {
            if (!js) { return; }
            if (issues.value.length) {
                return;
            }
            try {
                const b64moduleData = 'data:text/javascript;base64,' + btoa(js);
                const module = await import(/* @vite-ignore */ b64moduleData);

                if (!module.default) {
                    moduleIssues.value = [{ severity: 'error', line: 0, col: 0, message: 'Script has not default export' }];
                    return;
                }

                if (!module.default.prototype.constructor) {
                    moduleIssues.value = [{ severity: 'error', line: 0, col: 0, message: 'Script has no constructor' }];
                    return;
                }

                const newTimer = new Timer();

                // eslint-disable-next-line no-undef
                const newInst = new module.default(ledArray, newTimer) as netled.IAnimationScript;
                newInst.run({});

                console.log('Started new instance');

                if (inst) {
                    inst.pause();
                }

                timer?.dispose();
                
                inst = newInst;
                timer = newTimer;
            } catch (e: any) {
                moduleIssues.value = [{ severity: 'error', line: 0, col: 0, message: `Error creating instance of script: ${e.message ?? e.toString()}` }];
                console.error(e);
            }
        }, { immediate: true });

        return { issues: computed(() => [...issues.value, ...moduleIssues.value]), ledCanvas };
    },
});

</script>

<style lang="postcss" scoped>
    .ide-errors {
        min-height: 100px;
    }

    .led-canvas {
        height: 20px;
    }
</style>