
<template>
   <div id="app-wrapper" class="">
      <led-canvas id="convas" :animation="animation"></led-canvas>
      <controls
         id="controls"
         class="border border-dark shadow p-3"
         @update:animation="(a) => (animation = a)"
      ></controls>
   </div>
</template>

<script lang="ts">

   import { IAnimationContext } from '@/services/animationService';
   import { defineComponent, ref, watch } from 'vue';
   import Controls from './Controls.vue';
   import LedCanvas from './LedCanvas.vue';

   export default defineComponent({
      components: {
         LedCanvas,
         Controls
      },
      setup() {

         const animation = ref<IAnimationContext>();

         watch(animation, () => console.log('Ani'));

         return { animation };
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
