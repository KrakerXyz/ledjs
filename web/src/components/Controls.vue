
<template>
   <div class="d-flex flex-column">
      <div class="flex-grow-1">
         <div class="row">
            <div class="col-lg-6 col-xl-3 mb-3">
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
            <div class="col-lg-6 col-xl mb-3">
               <label for="c-interval" class="form-label">
                  Interval:
                  <input class="interval" v-model.number.lazy="interval" />ms

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="interval = 33"
                  >
                     30fps
                  </button>
                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="interval = 16"
                  >
                     60fps
                  </button>
               </label>
               <input
                  type="range"
                  class="form-range"
                  id="c-interval"
                  min="1"
                  max="500"
                  v-model.number.lazy="interval"
               />
            </div>
            <div class="col-lg-6 col-xl-2 mb-3">
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
            <div class="col-lg-6 col-xl-2 mb-3">
               <label for="c-brightness" class="form-label">
                  Brightness: {{ brightness }}
               </label>
               <input
                  type="range"
                  class="form-range"
                  id="c-interval"
                  min="0"
                  max="31"
                  v-model.number="brightness"
               />
            </div>
         </div>

         <div class="row">
            <div class="col-lg-6 mb-3" v-for="p of paramVms" :key="p.name">
               <div class="form-floating">
                  <input
                     v-if="p.meta.type === 'number'"
                     :id="`c-param-${p.name}`"
                     class="form-control"
                     placeholder="*"
                     v-model.lazy.trim="p.value"
                  />
                  <label :for="`c-param-${p.name}`">
                     {{ p.name }}
                  </label>
                  <small class="form-text">{{ p.meta.description }}</small>
               </div>
            </div>
         </div>
      </div>

      <div class="row">
         <div class="col-auto">
            <div class="form-check btn ps-4">
               <input
                  class="form-check-input"
                  type="checkbox"
                  id="c-auto-push"
                  v-model="autoPush"
               />
               <label class="form-check-label" for="c-auto-push">
                  Auto-Push to Devices
               </label>
            </div>
         </div>

         <div class="col-1" v-if="!autoPush">
            <button class="btn btn-primary w-100">Push</button>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

import { useAnimation, useAnimationContext, useAvailableAnimations, useWebSocket, useAnimationConfigMeta } from '../services';
import { Config, ConfigMetaParam } from '../animations';
import { computed, defineComponent, reactive, Ref, ref, watch } from 'vue';

export default defineComponent({
   setup() {

      const animations = useAvailableAnimations();

      const modelJson = localStorage.getItem('config');
      const model: StorageModel = {
         animation: animations[0],
         animationConfig: {},
         interval: 50,
         numLeds: 8,
         autoPush: true,
         brightness: 4,
         ...(modelJson ? JSON.parse(modelJson) : {})
      }

      const selectedAnimation = ref<string>(model.animation);

      const selectedAnimationStoredConfig = computed(() => {
         const json = localStorage.getItem(`${selectedAnimation.value}-config`);
         if (!json) { return {}; }
         const config: Config<any> = JSON.parse(json);
         return config;
      });

      const context = useAnimationContext();
      context.interval.value = model.interval;

      const brightness = ref(model.brightness);
      const numLeds = ref(model.numLeds);

      watch(selectedAnimation, async name => {
         const a = useAnimation(name);
         a.setNumLeds(numLeds.value);
         context.animation.value = a;
      }, { immediate: true });

      watch(numLeds, leds => {
         context.animation.value?.setNumLeds(leds);
      });

      const animationConfigMeta = computed(() => useAnimationConfigMeta(selectedAnimation.value));

      const paramVms = computed(() => {
         const params = animationConfigMeta.value?.params ?? {};
         return reactive(Object.getOwnPropertyNames(params).map(k => {
            const vm: ParamVm = {
               name: k,
               meta: params[k],
               value: selectedAnimationStoredConfig.value[k] ?? params[k].default
            };
            return vm;
         }));
      });

      const animationConfig = computed(() => {
         const config: Record<string, string | number | boolean> = {};
         for (const v of paramVms.value) {
            let value: string | number | boolean = v.value;;
            switch (v.meta.type) {
               case 'number': value = parseFloat(value); break;
               case 'boolean': value = value === 'true'; break;
            }
            config[v.name] = value;
         }
         return config;
      });

      watch(animationConfig, config => context.animation.value.setConfig(config), { immediate: true });

      const autoPush = ref(model.autoPush);
      const ws = useWebSocket();
      watch([...Object.values(context), numLeds, autoPush, brightness, animationConfig], () => {
         const newModel: StorageModel = {
            animation: selectedAnimation.value,
            interval: context.interval.value,
            numLeds: numLeds.value,
            autoPush: autoPush.value,
            brightness: brightness.value
         };
         localStorage.setItem('config', JSON.stringify(newModel));

         localStorage.setItem(`${selectedAnimation.value}-config`, JSON.stringify(animationConfig.value));

         if (!autoPush.value) { return; }
         ws.sendMessage({
            type: 'ledSetup',
            setup: {
               animationName: selectedAnimation.value,
               animationConfig: animationConfig.value,
               numLeds: numLeds.value,
               interval: context.interval.value
            }
         });

      });

      return { animations, selectedAnimation, interval: context.interval, numLeds, autoPush, brightness, paramVms };
   }
});

interface StorageModel {
   animation: string;
   interval: number;
   numLeds: number;
   autoPush: boolean;
   brightness: number;
}

interface ParamVm {
   name: string;
   meta: ConfigMetaParam;
   value: string;
}

</script>

<style lang="postcss" scoped>
input.interval {
   width: 5rem;
}
</style>