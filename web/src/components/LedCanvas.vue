
<template>
   <div
      class="h-100 overflow-hidden"
      ref="wrapper"
   >
      <canvas
         ref="can"
         class="d-block"
      ></canvas>
   </div>
</template>

<script lang="ts">

   import { Frame, rgbToHex } from 'netled';
   import { defineComponent, watch, ref, computed } from 'vue';


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

         watch(wrapper, () => setCanvasDimension());

         watch(frame, f => {
            if (!ctx.value) { return; }
            try {
               draw(ctx.value, f, canvasDimensions);
            } catch (e) {
               emit('drawError', e);
            }
         });

         window.addEventListener('resize', () => {
            if (!can.value) { return; }
            if (!ctx.value) { return; }

            setCanvasDimension();
         });

         const canWatchStop = watch(can, () => {

            if (!can.value) { return; }
            ctx.value = can.value.getContext('2d');
            if (!ctx.value) { return; }

            canvasDimensions = [window.innerWidth, window.innerHeight];
            can.value.width = window.innerWidth;
            can.value.height = window.innerHeight;

            try {
               draw(ctx.value, frame.value, canvasDimensions);
            } catch (e) {
               emit('drawError', e);
            }

            canWatchStop();
         });

         return { can, wrapper };
      }
   });

   const pi2 = Math.PI * 2;
   const lineWidth = 1;
   const padding = 2;
   const radius = 10;

   function draw(ctx: CanvasRenderingContext2D, frame: Frame, canvasDimensions: [number, number]) {

      ctx.clearRect(0, 0, canvasDimensions[0], canvasDimensions[1]);

      let xPos = radius + lineWidth;
      let yPos = radius + lineWidth;

      const ledDimension = (radius * 2) + (padding / 2) + (lineWidth * 2);

      const numX = Math.floor(canvasDimensions[0] / ledDimension);
      const numY = Math.floor(canvasDimensions[1] / ledDimension) - 1;

      if (lineWidth) {
         ctx.lineWidth = lineWidth;
         ctx.strokeStyle = '#000';
      }

      let dir = 1;

      let numDir = 0;

      let outOfRoom = false;

      for (let i = 0; i < frame.length; i++) {
         const led = frame[i];

         if (led.length !== 4) { throw new Error(`LED ${i} length != 4`); }
         if (led.some(l => typeof l !== 'number')) { throw new Error(`LED ${i} has non-numeric value`); }

         ctx.fillStyle = outOfRoom ? '#FF0000' : rgbToHex(led);

         ctx.beginPath();
         ctx.arc(xPos, yPos, radius, 0, pi2, false);
         ctx.closePath();
         ctx.fill();
         if (lineWidth) { ctx.stroke(); }

         if (outOfRoom) { break; }

         numDir++;

         if (dir === 1) {
            if (numDir === numX) {
               yPos = ledDimension + radius + lineWidth;
               dir = 2;
               numDir = 1;
            } else {
               xPos += ledDimension;
            }
         } else if (dir === 2) {
            yPos += ledDimension;
            if (numDir === numY) {
               dir = 3;
               numDir = 1;
            }
         } else if (dir === 3) {
            xPos -= ledDimension;
            if (numDir === numX) {
               dir = 4;
               numDir = 0;
            }
         } else {
            yPos -= ledDimension;
            if (numDir === numY) {
               outOfRoom = true;
            }
         }
      }

   }

</script>
