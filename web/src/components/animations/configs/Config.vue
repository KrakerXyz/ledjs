
<template>
   <div class="h-100 d-flex flex-column">
      <led-canvas id="canvas" :frame="frame"></led-canvas>

      <div class="flex-grow-1 container shadow bg-white p-3">
         <h1>{{ animation.name }}</h1>

         <div class="row">
            <div class="col-sm-6 col-lg-4 mb-3">
               <div class="form-floating">
                  <input
                     id="config-name"
                     class="form-control"
                     placeholder="*"
                     v-model="dirtyConfig.name"
                  />
                  <label for="config-name">Name</label>
               </div>
            </div>
         </div>

         <div class="row">
            <div class="col-lg-6 col-xl mb-3">
               <label for="c-interval" class="form-label">
                  Interval:
                  <input class="interval" v-model.number="dirtyConfig.animation.interval" />
                  ms, {{ Math.round(1000 / dirtyConfig.animation.interval) }}fps
                  <button
                     class="btn btn-primary py-0 px-2 ms-3"
                     @click="dirtyConfig.animation.interval = 16"
                  >60fps</button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="dirtyConfig.animation.interval = 33"
                  >30fps</button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="dirtyConfig.animation.interval = 66"
                  >15fps</button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="dirtyConfig.animation.interval = 200"
                  >5fps</button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="dirtyConfig.animation.interval = 500"
                  >2fps</button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="dirtyConfig.animation.interval = 1000"
                  >1fps</button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="dirtyConfig.animation.interval = 2000"
                  >0.5fps</button>
               </label>
               <input
                  type="range"
                  class="form-range"
                  id="c-interval"
                  min="3"
                  max="2000"
                  v-model.number="dirtyConfig.animation.interval"
               />
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

import { useAnimationRestClient } from '@/services';
import { deepClone, Frame } from 'netled';
import { defineComponent, reactive } from 'vue';
import LedCanvas from '@/components/LedCanvas.vue';

export default defineComponent({
   components: {
      LedCanvas
   },
   props: {
      configId: { type: String, required: true }
   },
   async setup(props) {

      const animationClient = useAnimationRestClient();

      const config = await animationClient.configById(props.configId);

      const animation = await animationClient.byId(config.animation.id, config.animation.version);

      const dirtyConfig = reactive(deepClone(config));

      const frame: Frame = [];

      return { dirtyConfig, animation, frame };
   }
});

</script>

<style lang="postcss" scoped>
#canvas {
   height: 20px;
}

label > input {
   width: 5rem;
}
</style>