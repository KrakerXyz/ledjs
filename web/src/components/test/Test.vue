
<template>
    <div class="h-100 row g-0">
        <!--         
                <div v-if="false">
                    <LedCanvas ref="ledCanvas"></LedCanvas>
                </div> -->
        <div class="col">
            <div class="h-100 d-flex flex-column">
                <div class="flex-grow-1 position-relative">
                    <div id="editor-ide-container" class="h-100 w-100 position-absolute" />
                </div>
    
                <div v-if="issues.length" class="ide-errors bg-secondary p-1">
                    <ul class="list-group font-monospace">
                        <li v-for="(i, $index) of issues" :key="$index">
                            <span v-if="i.severity === 'warning'"><i class="fal fa-exclamation-triangle"></i> Warning</span>
                            <span v-else><i class="fal fa-bomb"></i> Error</span>
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
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { LedArray } from './LedArray';
//import LedCanvas from './LedCanvas.vue';
import { useMonacoEditor } from './monacoEditor';
import { Script } from './Script';
import { Timer } from './Timer';
import types from './types.d.ts?raw';
import example from './Script.ts?raw';

export default defineComponent({
    //components: { LedCanvas },
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

        const { content, issues } = useMonacoEditor(
            'editor-ide-container',
            {
                typescriptLib: {
                    'global': types
                }
            }
        );

        content.value = example;

        return { issues };
    },
});

</script>

<style lang="postcss" scoped>
    .ide-errors {
        min-height: 100px;
    }
</style>