
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
import { LedSegment } from '$src/services/animation/LedSegment';
import { useCanvasRenderer } from '$src/services/animation/renderCanvas';
import { computed, defineComponent, onMounted, toRefs, useTemplateRef } from 'vue';
import { SegmentVm } from './StrandEditor.vue';

export default defineComponent({
    props: {
        segment: { type: Object as () => SegmentVm, required: true },
    },
    setup(props) {

        const { segment } = toRefs(props);

        const name = computed(() => segment.value.name);

        const canvasContainer = useTemplateRef<HTMLDivElement>('canvasContainer');
        const canvasRenderer = useCanvasRenderer(canvasContainer);

        const ledArrRend = computed(() => {
            const seg = segment.value;
            return new LedSegment(seg.sab, seg.numLeds, seg.startLed, canvasRenderer);
        });

        onMounted(() => {
           
            const defaultLedColor: IArgb = [255, 255, 0, 0];
            for(let i = 0; i < segment.value.numLeds; i++) {
                ledArrRend.value.setLed(i, defaultLedColor);
            }
            ledArrRend.value.send();
        });

        return {
            name
        };
    }
});

</script>
