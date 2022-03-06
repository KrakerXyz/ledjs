
<template>
   <div class="overflow-hidden" ref="wrapper">
      <canvas ref="can" class="d-block"></canvas>
   </div>
</template>

<script lang="ts">

import { Frame, rgbToHex } from '@krakerxyz/netled-core';
import { defineComponent, watch, ref, computed, onMounted, onUnmounted } from 'vue';

export default defineComponent({
    props: {
        frame: { type: Array as () => Frame }
    },
    emits: {
        drawError: (e: any) => !!e
    },
    setup(props, { emit }) {

        const frame = computed(() => props.frame ?? []);

        const wrapper = ref<HTMLDivElement>();

        const can = ref<HTMLCanvasElement>();

        let ctx = ref<CanvasRenderingContext2D | null>();

        let canvasDimensions: [number, number] = [0, 0];

        const setCanvasDimension = () => {
            if (!wrapper.value) { return; }
            const style = getComputedStyle(wrapper.value);
            const width = wrapper.value.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            const height = wrapper.value.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);

            canvasDimensions[0] = width;
            canvasDimensions[1] = height;

            if (!can.value) { return; }
            if (!ctx.value) { return; }
            can.value.width = width;
            can.value.height = height;

            if (!frame.value || !ctx.value) { return; }
            draw(ctx.value, frame.value, canvasDimensions);
        };

        const obs = new ResizeObserver(setCanvasDimension);
        onMounted(() => {
            console.assert(!!wrapper.value);
            if (!wrapper.value) { return; }
            obs.observe(wrapper.value);
        });

        watch(frame, f => {
            if (!ctx.value) { return; }
            try {
                draw(ctx.value, f, canvasDimensions);
            } catch (e) {
                emit('drawError', e);
            }
        });

        const canWatchStop = watch(can, () => {
            if (!can.value) { return; }
            ctx.value = can.value.getContext('2d');
            canWatchStop();
        });

        onUnmounted(() => {
            obs.disconnect();
        });

        return { can, wrapper };
    }
});

function draw(ctx: CanvasRenderingContext2D, frame: Frame, canvasDimensions: [number, number]) {


    ctx.clearRect(0, 0, canvasDimensions[0], canvasDimensions[1]);

    if (!frame.length) { return; }

    const ledWidth = canvasDimensions[0] / frame.length;
    const ledWidthCeil = Math.ceil(ledWidth);

    let offset = 0;
    for (let i = 0; i < frame.length; i++) {
        const led = frame[i];
        ctx.fillStyle = rgbToHex(led);
        ctx.fillRect(offset, 0, ledWidthCeil, canvasDimensions[1]);
        offset += ledWidth;
    }

}


</script>
