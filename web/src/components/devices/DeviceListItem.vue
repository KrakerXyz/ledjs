<template>
    <div class="card h-100">
        <div class="card-header">
            <div class="row">
                <div class="col">
                    <div class="card-title d-flex align-items-center">
                        <span
                            class="online-status d-inline-block me-2"
                            :class="{
                                'bg-success': deviceCopy.status.cameOnline > deviceCopy.status.wentOffline,
                                'bg-danger': deviceCopy.status.wentOffline >= deviceCopy.status.cameOnline,
                            }"
                        ></span>

                        <router-link :to="{ name: 'device-view', params: { deviceId: deviceCopy.id } }" class="text-body">
                            {{ deviceCopy.name }}
                        </router-link>
                    </div>
                </div>
                <div class="col-auto">
                    <button
                        type="button"
                        class="btn p-0 ms-2 text-success"
                        v-if="deviceCopy.isStopped"
                        @click.prevent="stop(deviceCopy, false)"
                    >
                        <i class="fas fa-play fa-fw"></i>
                    </button>

                    <button
                        type="button"
                        class="btn p-0 ms-2 text-danger"
                        v-if="!deviceCopy.isStopped"
                        @click.prevent="stop(deviceCopy, true)"
                    >
                        <i class="fas fa-stop fa-fw"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="card-body">
            <div class="form-floating">
                <select
                    id="device-animation"
                    class="form-select"
                    placeholder="*"
                    v-model="selectedConfigId"
                >
                    <option value>
                        None
                    </option>
                    <option v-for="c of configs" :key="c.id" :value="c.id">
                        {{ c.animationName }} - {{ c.name }}
                    </option>
                </select>
                <label for="device-animation">Animation</label>
            </div>

            <router-link class="small" v-if="selectedConfigId" :to="{ name: 'animation-config', params: { configId: selectedConfigId } }">
                Edit Config
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import type { Device } from '$core/rest/DeviceRestClient';
import type { AnimationConfigSummary } from '$core/rest/model/AnimationConfig';
import type { Id } from '$core/rest/model/Id';
import { deepClone } from '$core/services/deepClone';
import { useDevicesRestClient } from '$src/services';
import type { IDisposable } from 'monaco-editor';
import { computed, defineComponent, onUnmounted, reactive } from 'vue';

export default defineComponent({
    props: {
        device: { type: Object as () => Device, required: true },
        configs: { type: Array as () => AnimationConfigSummary[], required: true },
    },
    setup(props) {
        const devicesClient = useDevicesRestClient();

        const deviceCopy = reactive(deepClone(props.device));

        const selectedConfigId = computed({
            get() {
                return deviceCopy.animationConfigId ?? '';
            },
            set(configId: string) {
                devicesClient.setAnimationConfig({
                    deviceIds: [props.device.id],
                    configId: (configId as Id) || null,
                });
                deviceCopy.animationConfigId = configId as Id;
            },
        });

        const stop = (device: Device, value: boolean) => {
            devicesClient.stopAnimation({ deviceIds: [device.id], stop: value });
            //Need to clone and make the in-memory devices writeable
            deviceCopy.isStopped = value;
        };

        const disposables: IDisposable[] = [];

        onUnmounted(() => disposables.forEach((d) => d.dispose()));

        return { stop, selectedConfigId, deviceCopy };
    },
});

</script>

<style lang="postcss" scoped>
   .online-status {
      --size: 1rem;
      height: var(--size);
      width: var(--size);
      border-radius: var(--size);
   }
</style>
