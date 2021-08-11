<template>
   <div class="h-100 d-flex flex-column">
      <led-canvas id="canvas" :frame="frame"></led-canvas>

      <div class="flex-grow-1 container shadow bg-white p-3 d-flex flex-column">
         <div class="flex-grow-1">
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

               <div class="col mb-3">
                  <div class="form-floating">
                     <input
                        id="config-description"
                        class="form-control"
                        placeholder="*"
                        v-model="description"
                     />
                     <label for="config-description">Description</label>
                  </div>
               </div>
            </div>

            <div class="row">
               <div class="col-lg-6 col-xl mb-3">
                  <label for="c-interval" class="form-label">
                     Interval:
                     <input
                        class="interval"
                        v-model.number.lazy="dirtyConfig.animation.interval"
                     />
                     ms,
                     {{
                        Math.round(10000 / dirtyConfig.animation.interval) / 10
                     }}fps
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
                     min="5"
                     max="2000"
                     v-model.number="dirtyConfig.animation.interval"
                  />
               </div>
            </div>

            <div class="row">
               <div class="col-lg-6 mb-3" v-for="p of paramVms" :key="p.name">
                  <label class="form-label">
                     {{ p.name }}:
                     <input v-model.number="p.value" />
                     <small
                        v-if="p.meta.default"
                        class="form-text ms-2"
                     >Default {{ p.meta.default }}</small>
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

                  <small class="form-text">
                     {{
                        p.meta.description
                     }}
                  </small>
               </div>
            </div>
         </div>

         <div>
            <div class="row g-4">
               <div class="col-12 col-md mb-4">
                  <p>Preview Devices</p>
                  <div class="btn-group w-100">
                     <button
                        v-for="d of deviceVms"
                        :key="d.id"
                        class="btn"
                        :class="{ 'btn-primary': d.selected, 'btn-outline-primary': !d.selected }"
                        @click="toggleDevice(d)"
                     >{{ d.name }}</button>
                  </div>
               </div>

               <div class="col-md-3 col-xxl-2 d-flex align-items-end mb-4">
                  <button v-if="isDirty" class="btn w-100 btn-primary" @click="saveConfig()">Save</button>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">
import { useAnimationRestClient, useDevicesRestClient, useThrottledProxy } from '@/services';
import { AnimationNamedConfigPost, ConfigMetaParam, deepClone, deepEquals, DeviceAnimationPost, DeviceAnimationResetPost, Frame } from 'netled';
import { defineComponent, onUnmounted, reactive, watch, WatchStopHandle, ref, computed } from 'vue';
import LedCanvas from '@/components/LedCanvas.vue';
import { useIframeRunner } from '../editor/iframeRunner';

export default defineComponent({
   components: {
      LedCanvas,
   },
   props: {
      configId: { type: String, required: true },
   },
   async setup(props) {
      const stops: WatchStopHandle[] = [];
      onUnmounted(() => stops.forEach((s) => s()));

      const animationClient = useAnimationRestClient();
      const devicesClient = useDevicesRestClient();

      const devicesProm = devicesClient.list();

      //Not const because it's updated after a save
      const config = ref(await animationClient.configById(props.configId));

      const animation = await animationClient.byId(
         config.value.animation.id,
         config.value.animation.version
      );

      const devices = await devicesProm;

      const dirtyConfig = reactive(deepClone(config.value));
      const description = computed({
         get() { return dirtyConfig.description ?? ''; },
         set(v: string) { dirtyConfig.description = v || null; }
      });

      const iframe = await useIframeRunner(animation.script);

      await iframe.setNumLeds(60);

      const frame = ref<Frame>([]);
      frame.value = await iframe.nextFrame();

      const configMeta = await iframe.getConfigMeta();

      const paramVms = reactive(Object.getOwnPropertyNames(configMeta.params ?? {}).map(k => {
         const vm: ParamVm = {
            name: k,
            meta: configMeta.params[k],
            value: (config.value.animation.config ?? {})[k] ?? configMeta.params[k].default
         };
         return vm;
      }));

      const deviceVms = devices.map(d => {
         return reactive<DeviceVm>({
            id: d.id,
            name: d.name,
            selected: false
         });
      });

      const toggleDevice = (d: DeviceVm) => {
         d.selected = !d.selected;
         if (d.selected) {
            devicesClient.setAnimation({
               deviceIds: [d.id],
               animation: dirtyConfig.animation
            });
         } else {
            devicesClient.resetAnimation({ deviceIds: [d.id] });
         }
      };

      const resetDevices = () => {
         const previewDeviceIds = deviceVms.filter(d => d.selected).map(d => d.id);
         if (!previewDeviceIds.length) { return; }
         devicesClient.resetAnimation({ deviceIds: previewDeviceIds as DeviceAnimationResetPost['deviceIds'] });
      };

      stops.push(resetDevices);

      const isDirty = computed(() => !deepEquals(config.value, dirtyConfig));

      const saveConfig = async () => {
         if (!isDirty.value) { return; }
         const newConfig: AnimationNamedConfigPost = {
            id: dirtyConfig.id,
            name: dirtyConfig.name,
            animation: dirtyConfig.animation,
            description: dirtyConfig.description
         };
         config.value = deepClone(dirtyConfig);
         await animationClient.saveConfig(newConfig);

      };

      window.addEventListener('beforeunload', resetDevices, { capture: true });
      stops.push(() => window.removeEventListener('beforeunload', resetDevices));

      const throttledSetAnimation = useThrottledProxy(devicesClient.setAnimation.bind(devicesClient));

      stops.push(watch(dirtyConfig, (c) => {
         c.animation.interval = Math.round(c.animation.interval);

         const previewDeviceIds = deviceVms.filter(d => d.selected).map(d => d.id);
         if (previewDeviceIds.length) {
            throttledSetAnimation({
               deviceIds: previewDeviceIds as DeviceAnimationPost['deviceIds'],
               animation: dirtyConfig.animation
            });
         }
      }, { deep: true }));

      return { dirtyConfig, description, animation, frame, paramVms, deviceVms, toggleDevice, saveConfig, isDirty };
   }

});

interface ParamVm {
   name: string;
   meta: ConfigMetaParam;
   value: string | number;
}

interface DeviceVm {
   id: string;
   name: string;
   selected: boolean;
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