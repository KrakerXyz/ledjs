
<template>
   <div>
      <div class="row">
         <div class="col-lg-6 mb-3">
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

         <div class="col-lg-6">
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
      </div>
   </div>
</template>

<script lang="ts">

   import { useAnimation, useAnimationContext, useAvailableAnimations } from '@/services/animationService';
   import { defineComponent, ref, watch } from 'vue';

   export default defineComponent({
      setup() {

         const animations = useAvailableAnimations();

         const selectedAnimation = ref<string>(animations[0]);

         const context = useAnimationContext();

         const numLeds = ref(8);

         watch(selectedAnimation, async name => {
            const a = useAnimation(name);
            a.setNumLeds(numLeds.value);
            context.animation.value = a;
         }, { immediate: true });

         watch(numLeds, leds => {
            context.animation.value?.setNumLeds(leds);
         })

         return { animations, selectedAnimation, interval: context.interval };
      }
   });

</script>

<style lang="postcss" scoped>
   input.interval {
      width: 5rem;
   }
</style>