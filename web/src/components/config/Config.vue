
<template>
   <div class="h-100">
      <led-canvas id="canvas" :frame="frame"></led-canvas>

      <div id="controls" class="border border-dark shadow p-3">
         <div class="d-flex flex-column h-100">
            <div class="flex-grow-1">
               <div class="row">
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

   import { useWebSocket, useThrottledProxy, WsMessage, useRestClient } from '../../services';
   import { computed, defineComponent, getCurrentInstance, onUnmounted, reactive, ref, watch } from 'vue';
   import { useRoute } from 'vue-router';
   import LedCanvas from '../LedCanvas.vue';
   import { AnimationClient, Config, ConfigMetaParam } from 'netled';
   import { useIframeRunner } from '../editor/iframeRunner';
   import { Frame } from 'netled';

   export default defineComponent({
      components: {
         LedCanvas
      },
      async setup() {

         const componentInstance = getCurrentInstance();

         const route = useRoute()
         const animationId = computed(() => route.params['animationId'] as string);

         const restClient = useRestClient();
         const animationClient = new AnimationClient(restClient);
         const animation = await animationClient.byId(animationId.value, true);
         const iframe = await useIframeRunner(animation.script);

         const modelJson = localStorage.getItem('config');
         const model: StorageModel = reactive({
            animationConfig: {},
            interval: 50,
            numLeds: 8,
            autoPush: true,
            brightness: 4,
            ...(modelJson ? JSON.parse(modelJson) : {})
         });

         if (!model.numLeds) { model.numLeds = 8; }

         await iframe.setNumLeds(model.numLeds);
         const frame = ref<Frame>([]);
         frame.value = await iframe.nextFrame();

         const configMeta = await iframe.getConfigMeta();

         const selectedAnimationStoredConfig = computed(() => {
            const json = localStorage.getItem(`${animation.name}-config`);
            if (!json) { return {}; }
            const config: Config<any> = JSON.parse(json);
            return config;
         });

         const paramVms = reactive(Object.getOwnPropertyNames(configMeta.params ?? {}).map(k => {
            const vm: ParamVm = {
               name: k,
               meta: configMeta.params[k],
               value: selectedAnimationStoredConfig.value[k] ?? configMeta.params[k].default
            };
            return vm;
         }));

         const animationConfig = computed(() => {
            const config: Record<string, string | number | boolean> = {};
            for (const v of paramVms) {
               let value: string | number | boolean = v.value;;
               switch (v.meta.type) {
                  case 'number': value = parseFloat(value.toString()); break;
                  case 'boolean': value = value === 'true'; break;
               }
               config[v.name] = value;
            }
            return config;
         });

         watch(animationConfig, config => iframe.setConfig(config), { immediate: true });

         const ws = useWebSocket();

         const wsLedSetupThrottle = useThrottledProxy((msg: WsMessage) => ws.sendMessage(msg), { timeout: 500 });

         watch([model, animationConfig], () => {
            if (!model.numLeds) { return; }

            localStorage.setItem('config', JSON.stringify(model));
            localStorage.setItem(`${animation.name}-config`, JSON.stringify(animationConfig.value));

            if (!model.autoPush) { return; }

            wsLedSetupThrottle({
               type: 'ledSetup',
               setup: {
                  animationName: animation.name,
                  animationConfig: animationConfig.value,
                  numLeds: model.numLeds,
                  interval: model.interval
               }
            });

         });

         watch(() => model.numLeds, async leds => {
            if (!leds) { return; }
            console.log('Num leds changed');
            await iframe.setNumLeds(leds);
            frame.value = await iframe.nextFrame();
         });

         let intervalTimeout: number | undefined;

         watch(() => model.interval, interval => {
            if (intervalTimeout) { clearInterval(intervalTimeout); }

            intervalTimeout = setInterval(async () => {
               frame.value = [...await iframe.nextFrame()];
            }, interval);

         }, { immediate: true });

         onUnmounted(() => {
            iframe.dispose();
            if (intervalTimeout) { clearInterval(intervalTimeout); }
         }, componentInstance);

         return { model, paramVms, frame };
      }
   });

   interface StorageModel {
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
      --control-padding: 60px;
      position: absolute;
      top: var(--control-padding);
      left: var(--control-padding);
      width: calc(100% - var(--control-padding) * 2);
      height: calc(100% - var(--control-padding) * 2);
   }
</style>