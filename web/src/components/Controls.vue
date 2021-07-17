
<template>
   <div>
      <div class="row">
         <div class="col-lg-4 mb-3">
            <div class="form-floating">
               <select
                  id="c-animation"
                  class="form-select"
                  placeholder="*"
                  v-model="selectedAnimation"
               >
                  <option v-for="a of animations" :key="a" :value="a">
                     {{ a }}
                  </option>
               </select>
               <label for="c-animation">Animation</label>
            </div>
         </div>

         <div class="col-lg-4 mb-3">
            <label for="c-interval" class="form-label">
               Interval:
               <input class="interval" v-model.number.lazy="interval" />ms
            </label>
            <input
               type="range"
               class="form-range"
               id="c-interval"
               min="1"
               max="500"
               v-model.number="interval"
            />
         </div>

         <div class="col-lg-4 mb-3">
            <div class="form-floating">
               <input
                  id="c-num-leds"
                  class="form-control"
                  placeholder="*"
                  v-model.number.lazy="numLeds"
               />
               <label for="c-num-leds">Num Leds</label>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { useAnimation, useAnimationContext, useAvailableAnimations } from '@/services/animationService';
   import { defineComponent, ref, watch } from 'vue';

   export default defineComponent({
      setup() {

         const animations = useAvailableAnimations();

         const modelJson = localStorage.getItem('config');
         const model: StorageModel = modelJson ? JSON.parse(modelJson) : {
            animation: animations[0],
            interval: 50,
            numLeds: 8
         }

         const selectedAnimation = ref<string>(model.animation);

         const context = useAnimationContext();
         context.interval.value = model.interval;

         const numLeds = ref(model.numLeds);

         watch(selectedAnimation, async name => {
            const a = useAnimation(name);
            a.setNumLeds(numLeds.value);
            context.animation.value = a;
         }, { immediate: true });

         watch(numLeds, leds => {
            context.animation.value?.setNumLeds(leds);
         });

         watch(Object.values(context), () => {
            const newModel: StorageModel = {
               animation: selectedAnimation.value,
               interval: context.interval.value,
               numLeds: numLeds.value
            };
            localStorage.setItem('config', JSON.stringify(newModel));
         });

         return { animations, selectedAnimation, interval: context.interval, numLeds };
      }
   });

   interface StorageModel {
      animation: string;
      interval: number;
      numLeds: number;
   }

</script>

<style lang="postcss" scoped>
   input.interval {
      width: 5rem;
   }
</style>