
<template>
   <div id="app-wrapper" class="">
      <led-canvas id="canvas"></led-canvas>
      <div id="controls" class="border border-dark shadow p-3">
         <router-view></router-view>
      </div>
   </div>
</template>

<script lang="ts">

   import { defineComponent } from 'vue';
   import LedCanvas from './LedCanvas.vue';

   export default defineComponent({
      components: {
         LedCanvas
      },
      setup() {
         return {};
      }
   });

</script>

<style lang="postcss" scoped>
   #app-wrapper {
      --control-padding: 120px;
   }

   #controls {
      position: absolute;
      top: var(--control-padding);
      left: var(--control-padding);
      width: calc(100vw - var(--control-padding) * 2);
      height: calc(100vh - var(--control-padding) * 2);
   }
</style>
