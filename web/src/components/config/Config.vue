
<template>
   <div class="h-100">
      <led-canvas id="canvas" :frame="frame"></led-canvas>

      <div id="controls" class="border border-dark shadow p-3">
         <div class="d-flex flex-column h-100">
            <div class="flex-grow-1">
               <div class="row">
                  <div class="col-lg-6 col-xl-3 mb-3">
                     <div class="form-floating">
                        <select
                           id="c-animation"
                           class="form-select"
                           placeholder="*"
                           v-model="model.animationName"
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
                        <input
                           class="interval"
                           v-model.number="model.interval"
                        />ms

                        <button
                           class="btn btn-primary py-0 px-2 ms-1"
                           @click="model.interval = 33"
                        >
                           30fps
                        </button>
                        <button
                           class="btn btn-primary py-0 px-2 ms-1"
                           @click="model.interval = 16"
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
                        v-model.number="model.interval"
                     />
                  </div>
                  <div class="col-lg-6 col-xl-2 mb-3">
                     <div class="form-floating">
                        <input
                           id="c-num-leds"
                           class="form-control"
                           placeholder="*"
                           v-model.number="model.numLeds"
                        />
                        <label for="c-num-leds">Num Leds</label>
                     </div>
                  </div>
                  <div class="col-lg-6 col-xl-2 mb-3">
                     <label for="c-brightness" class="form-label">
                        Brightness: {{ model.brightness }}
                     </label>
                     <input
                        type="range"
                        class="form-range"
                        id="c-interval"
                        min="0"
                        max="31"
                        v-model.number="model.brightness"
                     />
                  </div>
               </div>

               <div class="row">
                  <div
                     class="col-lg-6 mb-3"
                     v-for="p of paramVms"
                     :key="p.name"
                  >
                     <div class="form-floating">
                        <input
                           v-if="p.meta.type === 'number'"
                           :id="`c-param-${p.name}`"
                           class="form-control"
                           placeholder="*"
                           v-model="p.value"
                        />
                        <label :for="`c-param-${p.name}`">
                           {{ p.name }}
                        </label>
                        <small class="form-text">{{
                           p.meta.description
                        }}</small>
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
                        v-model="model.autoPush"
                     />
                     <label class="form-check-label" for="c-auto-push">
                        Auto-Push to Devices
                     </label>
                  </div>
               </div>

               <div class="col-1" v-if="!model.autoPush">
                  <button class="btn btn-primary w-100">Push</button>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { useAnimation, useAvailableAnimations, useWebSocket, useAnimationConfigMeta, useThrottledProxy, WsMessage } from '../../services';
   import { AnimationInstance, Config, ConfigMetaParam } from '../../animations';
   import { computed, defineComponent, reactive, ref, watch } from 'vue';
   import LedCanvas from '../LedCanvas.vue';
   import { Frame } from '../../color-utilities';

   export default defineComponent({
      components: {
         LedCanvas
      },
      setup() {

         const animations = useAvailableAnimations();

         const modelJson = localStorage.getItem('config');
         const model: StorageModel = reactive({
            animationName: animations[0],
            animationConfig: {},
            interval: 50,
            numLeds: 8,
            autoPush: true,
            brightness: 4,
            ...(modelJson ? JSON.parse(modelJson) : {})
         });

         const selectedAnimationStoredConfig = computed(() => {
            const json = localStorage.getItem(`${model.animationName}-config`);
            if (!json) { return {}; }
            const config: Config<any> = JSON.parse(json);
            return config;
         });

         const animationInstance = ref<AnimationInstance<any>>();

         const animationConfigMeta = computed(() => useAnimationConfigMeta(model.animationName));

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
                  case 'number': value = parseFloat(value.toString()); break;
                  case 'boolean': value = value === 'true'; break;
               }
               config[v.name] = value;
            }
            return config;
         });

         const frame = ref<Frame>([]);
         for (let i = 0; i < model.numLeds; i++) { frame.value.push([0, 0, 0]); }

         watch(animationConfig, config => animationInstance.value?.setConfig(config), { immediate: true });

         const ws = useWebSocket();

         const wsLedSetupThrottle = useThrottledProxy((msg: WsMessage) => ws.sendMessage(msg), { timeout: 500 });

         watch([model, animationConfig], () => {

            localStorage.setItem('config', JSON.stringify(model));
            localStorage.setItem(`${model.animationName}-config`, JSON.stringify(animationConfig.value));

            if (!model.autoPush) { return; }

            wsLedSetupThrottle({
               type: 'ledSetup',
               setup: {
                  animationName: model.animationName,
                  animationConfig: animationConfig.value,
                  numLeds: model.numLeds,
                  interval: model.interval
               }
            });

         });

         watch(() => model.animationName, async name => {
            const a = useAnimation(name);
            a.setNumLeds(model.numLeds);
            animationInstance.value = a;
         }, { immediate: true });

         watch(() => model.numLeds, leds => {
            console.log('Num leds changed');
            if (!animationInstance.value) { }
            animationInstance.value?.setNumLeds(leds);
            frame.value = animationInstance.value.nextFrame();
         });

         let intervalTimeout: number | undefined;

         watch(() => model.interval, interval => {
            if (intervalTimeout) { clearInterval(intervalTimeout); }

            intervalTimeout = setInterval(() => {
               if (!animationInstance.value) { return; }
               frame.value = [...animationInstance.value.nextFrame()];
            }, interval);

         }, { immediate: true });

         return { animations, model, paramVms, frame };
      }
   });

   interface StorageModel {
      animationName: string;
      interval: number;
      numLeds: number;
      autoPush: boolean;
      brightness: number;
   }

   interface ParamVm {
      name: string;
      meta: ConfigMetaParam;
      value: string | number;
   }

</script>

<style lang="postcss" scoped>
   input.interval {
      width: 5rem;
   }

   #controls {
      --control-padding: 120px;
      position: absolute;
      top: var(--control-padding);
      left: var(--control-padding);
      width: calc(100vw - var(--control-padding) * 2);
      height: calc(100vh - var(--control-padding) * 2);
   }
</style>