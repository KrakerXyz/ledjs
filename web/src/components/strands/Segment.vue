
<template>
    <div>
        <h1>{{ segment.name }}</h1>
        <div ref="canvasContainer" class="canvas-container overflow-hidden"></div>
    </div>
</template>

<style lang="postcss" scoped>
    .canvas-container :deep(canvas) {
        height: 20px;
    }
</style>

<script lang="ts">

import { useCanvasRenderer } from '$src/services/animation/renderCanvas';
import { computed, defineComponent, getCurrentInstance, onUnmounted, ref, useTemplateRef } from 'vue';
import { SegmentVm } from './StrandEditor.vue';
import { useAnimationWorkerAsync } from '$src/services/animation/animationWorker';
import { assertTrue } from '$src/services';
import { usePostProcessorWorkerAsync } from '$src/services/animation/postProcessorWorker';
import { SegmentInputType } from '$core/rest/model/Strand';

export default defineComponent({
    props: {
        segment: { type: Object as () => SegmentVm, required: true },
    },
    async setup(props) {
        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const seg = props.segment;


        const canvasContainer = useTemplateRef<HTMLDivElement>('canvasContainer');
        const canvasRenderer = useCanvasRenderer(canvasContainer);

        seg.ledSegment.addSendCallback(canvasRenderer);


        if (seg.type === SegmentInputType.Animation) {
            const anim = await useAnimationWorkerAsync(ref(seg.js), computed(() => seg.ledSegment));
            onUnmounted(() => {
                anim.dispose();
            }, componentInstance);
        } else {
            const pp = await usePostProcessorWorkerAsync(ref(seg.js), computed(() => seg.ledSegment));
            seg.prevLedSegment?.addSendCallback(pp.ledSegmentInput);
        }
        

        return {
            name
        };
    }
});

</script>
