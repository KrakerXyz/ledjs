
<template>
   <canvas ref="can" class="d-block"></canvas>
</template>

<script lang="ts">

import { defineComponent, watch, ref } from 'vue';
import * as Animation from '../animations';
import { Frame, rgbToHex } from '../color-utilities';


export default defineComponent({
   props: {
   },
   setup() {

      const can = ref<HTMLCanvasElement>();

      //const animation = new Animation.Rainbow(144);
      //const animation = new Animation.Umbrella(144);
      //const animation = new Animation.Sparkle(144);
      const animation = new Animation.Flames(144, { cooling: 65, sparking: 50 });

      let ctx: CanvasRenderingContext2D | undefined | null;
      let canvasDimensions: [number, number] = [window.innerWidth, window.innerHeight];
      let frame = animation.nextFrame();

      window.addEventListener('resize', () => {
         if (!can.value) { return; }
         if (!ctx) { return; }
         can.value.width = window.innerWidth;
         can.value.height = window.innerHeight;
         canvasDimensions = [window.innerWidth, window.innerHeight];
         draw(ctx, frame, canvasDimensions);
      });

      watch(can, () => {

         if (!can.value) { return; }
         ctx = can.value.getContext('2d');
         if (!ctx) { return; }

         can.value.width = window.innerWidth;
         can.value.height = window.innerHeight;
         ;
         draw(ctx, frame, canvasDimensions);

         setInterval(() => {
            if (!ctx) { return; }
            frame = animation.nextFrame();
            draw(ctx, frame, canvasDimensions);
         }, 20);

      });

      return { can };
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

   for (const led of frame) {
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
