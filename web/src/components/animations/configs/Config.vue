<template>
  <div class="h-100 d-flex flex-column">
    <led-canvas id="canvas" :frame="frame"></led-canvas>

    <div class="flex-grow-1 container shadow bg-white p-3 d-flex flex-column">
      <div class="flex-grow-1">
        <div class="row">
          <div class="col">
            <h1>{{ animation.name }}</h1>
          </div>

          <div class="col-auto d-flex align-items-center">
            <button type="button" class="btn text-danger" @click="deleteConfirmation = true">
              <i class="fal fa-trash-alt fa-lg"></i>
            </button>
          </div>
        </div>

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
          <div class="col-lg-6 col-xl mb-3 d-flex flex-column justify-content-end">
            <label for="c-interval" class="form-label">
              Interval:
              <input class="interval" v-model.number.lazy="dirtyConfig.animation.interval" />
              ms,
              {{ Math.round(10000 / dirtyConfig.animation.interval) / 10 }}fps
              <button type="button" class="btn btn-primary py-0 px-2 ms-3" @click="dirtyConfig.animation.interval = 16">60fps</button>

              <button type="button" class="btn btn-primary py-0 px-2 ms-1" @click="dirtyConfig.animation.interval = 33">30fps</button>

              <button type="button" class="btn btn-primary py-0 px-2 ms-1" @click="dirtyConfig.animation.interval = 66">15fps</button>

              <button type="button" class="btn btn-primary py-0 px-2 ms-1" @click="dirtyConfig.animation.interval = 200">5fps</button>

              <button type="button" class="btn btn-primary py-0 px-2 ms-1" @click="dirtyConfig.animation.interval = 500">2fps</button>

              <button type="button" class="btn btn-primary py-0 px-2 ms-1" @click="dirtyConfig.animation.interval = 1000">1fps</button>

              <button type="button" class="btn btn-primary py-0 px-2 ms-1" @click="dirtyConfig.animation.interval = 2000">0.5fps</button>
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

          <div class="col-lg-6 col-xl mb-3 d-flex flex-column justify-content-end">
            <label for="c-brightness" class="form-label">Brightness ({{ Math.round((dirtyConfig.animation.brightness / 255) * 100) }}%)</label>
            <input
              type="range"
              class="form-range"
              id="c-brightness"
              min="0"
              max="255"
              v-model.number="dirtyConfig.animation.brightness"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-lg-6 mb-3" v-for="p of paramVms" :key="p.name">
            <div v-if="p.meta.type === 'number'" class="mb-3">
              <div class="row">
                <div class="col-lg-auto">
                  <div class="form-floating">
                    <input
                      :id="`config-${p.name}`"
                      class="form-control"
                      placeholder="*"
                      v-model="p.value"
                    />
                    <label :for="`config-${p.name}`">{{ p.name }}</label>
                  </div>
                </div>
                <div class="col-lg d-flex align-items-end">
                  <input
                    type="range"
                    v-if="p.meta.type === 'number'"
                    :id="`c-param-${p.name}`"
                    class="form-range"
                    :min="p.meta.min"
                    :max="p.meta.maxRecommended ?? p.meta.max"
                    v-model="p.value"
                  />
                </div>
              </div>
              <small class="text-muted">{{ p.meta.description }}. Default {{ p.meta.default }}</small>
            </div>

            <div class="mb-3" v-if="p.meta.type === 'color'">
              <div class="row">
                <div class="col-auto">
                  <label>{{ p.name }}</label>
                </div>
                <div class="col">
                  <input type="color" v-model="p.value" />
                  {{ p.value }}
                </div>
              </div>
              <small class="text-muted">{{ p.meta.description }}. Default {{ p.meta.default }}</small>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="row g-4">
          <div class="col-12 col-md mb-4">
            <p>Preview Devices</p>
            <div class="btn-group w-100">
              <button
                type="button"
                v-for="d of deviceVms"
                :key="d.id"
                class="btn btn-device"
                :class="{ 'btn-primary': d.selected, 'btn-outline-primary': !d.selected }"
                @click="toggleDevice(d)"
              >
                {{ d.name }}
              </button>
            </div>
          </div>

          <div class="col-md-3 col-xxl-2 d-flex align-items-end mb-md-4">
            <button
              type="button"
              v-if="isDirty"
              class="btn w-100 btn-primary"
              @click="saveConfig(false)"
            >
              Save
            </button>
          </div>
          <div class="col-md-2 col-xxl-1 d-flex align-items-end mb-md-4">
            <button
              type="button"
              v-if="isDirty"
              class="btn w-100 btn-info"
              @click="saveConfig(true)"
            >
              As New
            </button>
          </div>
        </div>
      </div>
    </div>

    <v-confirmation-modal v-if="deleteConfirmation" @cancel="deleteConfirmation = false" @confirm="deleteConfig()">
      Are you sure you want to delete this configuration?
    </v-confirmation-modal>
  </div>
</template>

<script lang="ts">
  import { useAnimationRestClient, useDevicesRestClient, useThrottledProxy } from '@/services';
  import {
    AnimationNamedConfigPost,
    ConfigMetaParam,
    deepClone,
    deepEquals,
    DeviceAnimationPost,
    DeviceAnimationResetPost,
    Frame,
    Id,
    newId,
  } from '@krakerxyz/netled-core';
  import { defineComponent, onUnmounted, reactive, watch, WatchStopHandle, ref, computed } from 'vue';
  import LedCanvas from '@/components/LedCanvas.vue';
  import { useIframeRunner } from '../editor/iframeRunner';
  import { useRouter } from 'vue-router';

  export default defineComponent({
    components: {
      LedCanvas,
    },
    props: {
      configId: { type: String as () => Id, required: true },
    },
    async setup(props) {
      const router = useRouter();

      const stops: WatchStopHandle[] = [];
      onUnmounted(() => stops.forEach((s) => s()));

      const animationClient = useAnimationRestClient();
      const devicesClient = useDevicesRestClient();

      const devicesProm = devicesClient.list(true);

      //Not const because it's updated after a save
      const config = ref(await animationClient.config.byId(props.configId));

      const animation = await animationClient.byId(config.value.animation.id, config.value.animation.version);

      const devices = await devicesProm;

      const dirtyConfig = reactive(deepClone(config.value));
      const description = computed({
        get() {
          return dirtyConfig.description ?? '';
        },
        set(v: string) {
          dirtyConfig.description = v || null;
        },
      });

      const iframe = await useIframeRunner(animation.script);
      stops.push(iframe.dispose);

      await iframe.setNumLeds(60);

      const frame = ref<Frame>([]);
      frame.value = await iframe.nextFrame();

      const tick = async () => {
        frame.value = await iframe.nextFrame();
      };

      let lastInterval = config.value.animation.interval;
      let intervalTimeout = setInterval(tick, config.value.animation.interval);

      stops.push(() => clearInterval(intervalTimeout));

      const configMeta = await iframe.getConfigMeta();

      const paramVms = reactive(
        Object.getOwnPropertyNames(configMeta.params ?? {}).map((k) => {
          const vm: ParamVm = {
            name: k,
            meta: configMeta.params[k],
            value: (config.value.animation.config ?? {})[k] ?? configMeta.params[k].default,
          };
          return vm;
        })
      );

      stops.push(
        watch(
          paramVms,
          (vms) => {
            const newConfig = Object.fromEntries(vms.map((v) => [v.name, v.value]));
            (dirtyConfig.animation.config as Record<string, any>) = newConfig;
            iframe.setConfig(newConfig);
          },
          { deep: true }
        )
      );

      const deviceVms = devices
        .filter((d) => d.status.cameOnline > d.status.wentOffline)
        .map((d) => {
          return reactive<DeviceVm>({
            id: d.id,
            name: d.name,
            selected: false,
          });
        });

      const toggleDevice = (d: DeviceVm) => {
        d.selected = !d.selected;
        if (d.selected) {
          devicesClient.setAnimation({
            deviceIds: [d.id],
            animation: dirtyConfig.animation,
          });
          devicesClient.stopAnimation({
            deviceIds: [d.id],
            stop: false,
            persist: false,
          });
        } else {
          devicesClient.resetAnimation({ deviceIds: [d.id] });
        }
      };

      const resetDevices = () => {
        const previewDeviceIds = deviceVms.filter((d) => d.selected).map((d) => d.id);
        if (!previewDeviceIds.length) {
          return;
        }
        devicesClient.resetAnimation({ deviceIds: previewDeviceIds as DeviceAnimationResetPost['deviceIds'] });
      };

      stops.push(resetDevices);

      const isDirty = computed(() => !deepEquals(config.value, dirtyConfig));

      const saveConfig = async (asNew: boolean) => {
        if (!isDirty.value) {
          return;
        }

        const newConfig: AnimationNamedConfigPost = {
          id: asNew ? newId() : dirtyConfig.id,
          name: dirtyConfig.name,
          animation: dirtyConfig.animation,
          description: dirtyConfig.description,
        };

        config.value = deepClone(dirtyConfig);

        await animationClient.config.save(newConfig);

        const selectedDeviceIds = deviceVms.filter((d) => d.selected).map((d) => d.id);
        if (selectedDeviceIds.length) {
          devicesClient.setAnimationConfig({
            configId: newConfig.id,
            deviceIds: selectedDeviceIds as [Id, ...Id[]],
          });
        }

        if (asNew) {
          router.push({ params: { configId: newConfig.id } });
        }
      };

      window.addEventListener('beforeunload', resetDevices, { capture: true });
      stops.push(() => window.removeEventListener('beforeunload', resetDevices));

      const throttledSetAnimation = useThrottledProxy(devicesClient.setAnimation.bind(devicesClient));

      stops.push(
        watch(
          dirtyConfig,
          (c) => {
            c.animation.interval = Math.round(c.animation.interval);

            if (c.animation.interval !== lastInterval) {
              clearInterval(intervalTimeout);
              intervalTimeout = setInterval(tick, c.animation.interval);
              lastInterval = c.animation.interval;
            }

            const previewDeviceIds = deviceVms.filter((d) => d.selected).map((d) => d.id);
            if (previewDeviceIds.length) {
              throttledSetAnimation({
                deviceIds: previewDeviceIds as DeviceAnimationPost['deviceIds'],
                animation: dirtyConfig.animation,
              });
            }
          },
          { deep: true }
        )
      );

      const deleteConfirmation = ref(false);

      const deleteConfig = async () => {
        await animationClient.config.delete(props.configId);
        router.replace({
          name: 'animation-configs',
          params: {
            animationId: config.value.animation.id,
            version: config.value.animation.version,
          },
        });
      };

      return { dirtyConfig, description, animation, frame, paramVms, deviceVms, toggleDevice, saveConfig, isDirty, deleteConfirmation, deleteConfig };
    },
  });

  interface ParamVm {
    name: string;
    meta: ConfigMetaParam;
    value: string | number;
  }

  interface DeviceVm {
    id: Id;
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

  .btn-device {
    max-width: 200px;
  }
</style>
