
<template>
    <div class="overflow-hidden" ref="wrapper">
        <canvas ref="can" class="d-block"></canvas>
    </div>
</template>

<script lang="ts">

import { defineComponent, watch, ref, onMounted, onUnmounted } from 'vue';
import type { LedSegment } from '../../../core/src/LedSegment';
import type { IArgb } from '$core/IArgb';
import { rgbToHex } from '$core/color-utilities/rgbToHex';

export default defineComponent({
    emits: {
        drawError: (e: any) => !!e
    },
    setup(props, { emit }) {

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
        };

        const obs = new ResizeObserver(setCanvasDimension);
        onMounted(() => {
            console.assert(!!wrapper.value);
            if (!wrapper.value) { return; }
            obs.observe(wrapper.value);
        });

        const render = (sab: LedSegment) => {
            if (!ctx.value) { return; }
            try {
                draw(ctx.value, sab, canvasDimensions);
            } catch (e) {
                emit('drawError', e);
            }
        };

        const canWatchStop = watch(can, () => {
            if (!can.value) { return; }
            ctx.value = can.value.getContext('2d');
            canWatchStop();
        });

        onUnmounted(() => {
            obs.disconnect();
        });

        return { can, wrapper, render };
    }
});

function draw(ctx: CanvasRenderingContext2D, arr: LedSegment, canvasDimensions: [number, number]) {


    ctx.clearRect(0, 0, canvasDimensions[0], canvasDimensions[1]);

    const ledWidth = canvasDimensions[0] / arr.length;
    const ledWidthCeil = Math.ceil(ledWidth);

    let offset = 0;
    for (let i = 0; i < arr.length; i++) {
        const led: IArgb = arr.getLed(i);
        ctx.fillStyle = rgbToHex(led);
        ctx.fillRect(offset, 0, ledWidthCeil, canvasDimensions[1]);
        offset += ledWidth;
    }

}


</script>
