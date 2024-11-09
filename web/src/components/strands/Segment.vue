
<template>
    <div>
        <h1>{{ name }}</h1>
        <div ref="canvasContainer" class="canvas-container overflow-hidden"></div>
    </div>
</template>

<style lang="postcss" scoped>
    .canvas-container :deep(canvas) {
        height: 20px;
    }
</style>

<script lang="ts">

import type { IArgb } from '$core/IArgb';
import { LedArray } from '$src/services/animation/LedArray';
import { useCanvasRenderer } from '$src/services/animation/renderCanvas';
import { computed, defineComponent, onMounted, toRefs, useTemplateRef } from 'vue';

export default defineComponent({
    props: {
        name: { type: String, required: true },
        sab: { type: SharedArrayBuffer, required: true },
        numLeds: { type: Number, required: true }
    },
    setup(props) {

        const { sab, numLeds } = toRefs(props);

        const canvasContainer = useTemplateRef<HTMLDivElement>('canvasContainer');
        const canvasRenderer = useCanvasRenderer(canvasContainer);

        const ledArrRend = computed(() => {
            return new LedArray(sab.value, numLeds.value, 0, canvasRenderer);
        });

        onMounted(() => {
           
            const defaultLedColor: IArgb = [255, 255, 0, 0];
            for(let i = 0; i < numLeds.value; i++) {
                ledArrRend.value.setLed(i, defaultLedColor);
            }
            ledArrRend.value.send();
        });

        return {
            
        };
    }
});

</script>
