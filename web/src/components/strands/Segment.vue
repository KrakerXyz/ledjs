
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
import { computed, defineComponent, onUnmounted, ref, useTemplateRef } from 'vue';
import { SegmentVm } from './StrandEditor.vue';
import { useAnimationWorkerAsync } from '$src/services/animation/animationWorker';
import { usePostProcessorWorkerAsync } from '$src/services/animation/postProcessorWorker';
import { SegmentInputType } from '$core/rest/model/Strand';

export default defineComponent({
    props: {
        segment: { type: Object as () => SegmentVm, required: true },
    },
    setup(props) {
        const seg = props.segment;

        const canvasContainer = useTemplateRef<HTMLDivElement>('canvasContainer');
        const canvasRenderer = useCanvasRenderer(canvasContainer);

        seg.ledSegment.addSendCallback(canvasRenderer);

        // At first this was using awaits to get the worker results before registering the unMounted but if it was sometimes leaving behind a worker when we deleted all but the last segment
        if (seg.type === SegmentInputType.Animation) {
            console.log(`Starting new animation worker for ${seg.name}`);
            const animProm = useAnimationWorkerAsync(ref(seg.js), computed(() => seg.ledSegment));
            onUnmounted(() => {
                animProm.then(anim => {
                    console.log('Disposing animation worker');
                    anim.dispose();
                });
            });
        } else {
            console.log(`Starting new post processor worker for ${seg.name}`);
            const ppProm = usePostProcessorWorkerAsync(ref(seg.js), computed(() => seg.ledSegment));
            ppProm.then(pp => {
                seg.prevLedSegment?.addSendCallback(pp.ledSegmentInput);
            });

            onUnmounted(() => {
                ppProm.then(pp => {
                    console.log('Disposing post processor worker');
                    pp.dispose();
                });
            });
        }

        return {
        }
    }
});

</script>
