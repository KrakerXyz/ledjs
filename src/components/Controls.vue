
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
               Interval: {{ interval }}ms
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

   import { IAnimationContext, useAnimationService, useAvailableAnimations } from '@/services/animationService';
   import { computed, defineComponent, reactive, ref, watch } from 'vue';

   export default defineComponent({
      emits: {
         'update:animation': (value: IAnimationContext | undefined) => !!value || true
      },
      setup(_, { emit }) {

         const animationService = useAnimationService(144);

         const animations = useAvailableAnimations();

         const selectedAnimation = ref<string>(animations[0]);

         const context = ref<IAnimationContext | undefined>();

         watch(selectedAnimation, async name => {
            const a = await animationService.getContext(name);
            context.value = a;
         }, { immediate: true });

         watch(context, c => {
            emit('update:animation', c);
         }, { immediate: true, deep: true });

         const interval = computed({
            get() {
               return context.value?.interval ?? 0;
            },
            set(value: number) {
               //I tried just updating context.value and re-emitting but App is not picking it up unless it's a new reference. I've even tried {...c} but it still saw it as the same instance.
               animationService.getContext(selectedAnimation.value).then(c => context.value = { ...c, interval: value });
            }
         });

         return { animations, selectedAnimation, interval };
      }
   });

</script>
