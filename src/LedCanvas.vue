
<template>
   <canvas ref="can" class="d-block"></canvas>
</template>

<script lang="ts">

import { defineComponent, watch, ref } from 'vue';

type RGB = [number, number, number];
type Frame = RGB[];

export default defineComponent({
   props: {
   },
   setup() {

      const can = ref<HTMLCanvasElement>();

      let ctx: CanvasRenderingContext2D | undefined | null;
      let canvasDimensions: [number, number] = [window.innerWidth, window.innerHeight];
      let frame = createFrame()

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
            const led0 = frame[0];
            for (let i = 1; i < frame.length; i++) {
               frame[i - 1] = frame[i];
            }
            frame[frame.length - 1] = led0;
            draw(ctx, frame, canvasDimensions);
         }, 50);

      });

      return { can };
   }
});

const pi2 = Math.PI * 2;
const lineWidth = 1;
const padding = 2;
const numLeds = 144;
const radius = 10;

function createFrame(): Frame {

   const space = 360 / numLeds;

   const leds: [number, number, number][] = [];
   for (let i = 0; i < numLeds; i++) {
      const h = i * space;
      const rgb = hslToRgb(h, 50, 50);
      leds.push(rgb);
   }

   return leds;

}

//https://css-tricks.com/converting-color-spaces-in-javascript/#hsl-to-rgb
function hslToRgb(h: number, s: number, l: number): RGB {
   // Must be fractions of 1
   s /= 100;
   l /= 100;

   let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c / 2,
      r = 0,
      g = 0,
      b = 0;

   if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
   } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
   } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
   } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
   } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
   } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
   }
   r = Math.round((r + m) * 255);
   g = Math.round((g + m) * 255);
   b = Math.round((b + m) * 255);

   return [r, g, b];
}

//https://css-tricks.com/converting-color-spaces-in-javascript/#hsl-to-rgb
function rgbToHex(rgb: RGB): string {
   const r = rgb[0].toString(16);
   const g = rgb[1].toString(16);
   const b = rgb[2].toString(16);

   const hex = `#${r.padStart(2, '0')}${g.padStart(2, '0')}${b.padStart(2, '0')}`;
   return hex;
}

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
