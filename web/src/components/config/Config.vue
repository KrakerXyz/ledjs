
<template>
   <div class="h-100 d-flex flex-column">
      <led-canvas
         id="canvas"
         :frame="frame"
      ></led-canvas>

      <div class="flex-grow-1 container shadow bg-white p-3">

         <div class="row">
            <div class="col-lg-6 col-xl mb-3">
               <label
                  for="c-interval"
                  class="form-label"
               >
                  Interval:
                  <input
                     class="interval"
                     v-model.number="model.interval"
                  />ms

                  <button
                     class="btn btn-primary py-0 px-2"
                     @click="model.interval = 16"
                  >
                     60fps
                  </button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="model.interval = 33"
                  >
                     30fps
                  </button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="model.interval = 66"
                  >
                     15fps
                  </button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="model.interval = 200"
                  >
                     5fps
                  </button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="model.interval = 500"
                  >
                     2fps
                  </button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="model.interval = 1000"
                  >
                     1fps
                  </button>

                  <button
                     class="btn btn-primary py-0 px-2 ms-1"
                     @click="model.interval = 2000"
                  >
                     0.5fps
                  </button>
               </label>
               <input
                  type="range"
                  class="form-range"
                  id="c-interval"
                  min="1"
                  max="2000"
                  v-model.number="model.interval"
               />
            </div>
         </div>

         <div class="row">
            <div
               class="col-lg-6 mb-3"
               v-for="p of paramVms"
               :key="p.name"
            >
               <label class="form-label">
                  {{p.name}}:
                  <input v-model.number="p.value" />
                  <small
                     v-if="p.meta.default"
                     class="form-text ms-2"
                  >
                     Default {{p.meta.default}}
                  </small>
               </label>

               <input
                  type="range"
                  v-if="p.meta.type === 'number'"
                  :id="`c-param-${p.name}`"
                  class="form-range"
                  :min="p.meta.min"
                  :max="p.meta.maxRecommended ?? p.meta.max"
                  v-model="p.value"
               />

               <small class="form-text">{{
                           p.meta.description
                        }}</small>
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
                  <label
                     class="form-check-label"
                     for="c-auto-push"
                  >
                     Auto-Push to Devices
                  </label>
               </div>
            </div>
            <div
               class="col-1"
               v-if="!model.autoPush"
            >
               <button class="btn btn-primary w-100">Push</button>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { useThrottledProxy, useRestClient } from '../../services';
   import { computed, defineComponent, getCurrentInstance, onUnmounted, reactive, ref, watch } from 'vue';
   import { useRoute } from 'vue-router';
   import LedCanvas from '../LedCanvas.vue';
   import { AnimationRestClient, ConfigMetaParam, DeviceAnimationPost, DeviceRestClient } from 'netled';
   import { useIframeRunner } from '../editor/iframeRunner';
   import { Frame } from 'netled';

   export default defineComponent({
      components: {
         LedCanvas
      },
      async setup() {

         const componentInstance = getCurrentInstance();

         const route = useRoute();
         const animationId = computed(() => route.params['animationId'] as string);

         const restClient = useRestClient();
         const animationClient = new AnimationRestClient(restClient);

         const devicesClient = new DeviceRestClient(restClient);
         const devices = await devicesClient.list(false);

         const animation = await animationClient.latest(animationId.value, true);
         const iframe = await useIframeRunner(animation.script);

         const modelJson = localStorage.getItem('config');
         const model: StorageModel = reactive({
            animationConfig: {},
            interval: 50,
            autoPush: true,
            ...(modelJson ? JSON.parse(modelJson) : {})
         });

         await iframe.setNumLeds(60);
         const frame = ref<Frame>([]);
         frame.value = await iframe.nextFrame();

         const configMeta = await iframe.getConfigMeta();

         const selectedAnimationStoredConfig = computed(() => {
            const json = localStorage.getItem(`${animation.name}-config`);
            if (!json) { return {}; }
            const config: Record<string, any> = JSON.parse(json);
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
               let value: string | number | boolean = v.value;
               switch (v.meta.type) {
                  case 'number': value = parseFloat(value.toString()); break;
                  case 'boolean': value = value === 'true'; break;
               }
               config[v.name] = value;
            }
            return config;
         });

         const animationConfigWatchStop = watch(animationConfig, config => iframe.setConfig(config), { immediate: true });

         const wsLedSetupThrottle = useThrottledProxy((setup: DeviceAnimationPost) => devicesClient.setAnimation(setup), { timeout: 1000 });

         const modelAnimationConfigWatchStop = watch([model, animationConfig], () => {

            localStorage.setItem('config', JSON.stringify(model));
            localStorage.setItem(`${animation.name}-config`, JSON.stringify(animationConfig.value));

            if (!model.autoPush) { return; }
            if (!devices.length) { return; }

            wsLedSetupThrottle({
               deviceIds: devices.map(d => d.id) as [string, ...string[]],
               animation: {
                  id: animation.id,
                  version: animation.version,
                  interval: model.interval,
                  config: animationConfig.value
               }
            });

         }, { immediate: true });

         let intervalTimeout: number | undefined;

         const intervalWatchStop = watch(() => model.interval, interval => {
            if (intervalTimeout) { clearInterval(intervalTimeout); }

            intervalTimeout = setInterval(async () => {
               frame.value = [...await iframe.nextFrame()];
            }, interval);

         }, { immediate: true });

         onUnmounted(() => {
            iframe.dispose();
            if (intervalTimeout) { clearInterval(intervalTimeout); }
            animationConfigWatchStop();
            intervalWatchStop();
            modelAnimationConfigWatchStop();
         }, componentInstance);

         return { model, paramVms, frame };
      }
   });

   interface StorageModel {
      interval: number;
      autoPush: boolean;
   }

   interface ParamVm {
      name: string;
      meta: ConfigMetaParam;
      value: string | number;
   }

</script>

<style lang="postcss" scoped>
   #canvas {
      height: 20px;
   }

   label > input {
      width: 5rem;
   }
</style>