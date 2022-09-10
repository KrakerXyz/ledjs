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

            <div v-if="telemetry.length" class="mt-3">
                <div class="alert alert-primary mb-2" v-for="item of telemetry" :key="item.name">
                    <div class="row">
                        <div class="col">
                            {{ item.name }}
                        </div>
                        <div class="col-auto">
                            {{ item.value }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { useDevicesRestClient, useWsClient } from '@/services';
import { animationConfigSummary, deepClone, Device, DeviceHealthData, Disposable, Id } from '@krakerxyz/netled-core';
import { computed, defineComponent, onUnmounted, reactive, ref } from 'vue';

export default defineComponent({
    props: {
        device: { type: Object as () => Device, required: true },
        configs: { type: Array as () => animationConfigSummary[], required: true },
    },
    setup(props) {
        const devicesClient = useDevicesRestClient();
        const ws = useWsClient();

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

        const telemetry = ref<TelemetryItem[]>([]);

        const disposables: Disposable[] = [];
        disposables.push(
            ws.on('deviceMessage', (msg) => {
                if (msg.deviceId !== props.device.id) { return; }

                if (msg.type === 'health') {
                    telemetry.value = Object.entries(msg.data).map((kvp) => {
                        return {
                            name: kvp[0] as keyof DeviceHealthData,
                            value: kvp[1].toString(),
                        };
                    });
                }
            })
        );

        disposables.push(
            ws.on('deviceConnection', (data) => {
                if (data.deviceId !== deviceCopy.id) {
                    return;
                }
                if (data.state === 'connected') {
                    deviceCopy.status.cameOnline = Date.now();
                } else {
                    telemetry.value = [];
                    deviceCopy.status.wentOffline = Date.now();
                }
            })
        );

        onUnmounted(() => disposables.forEach((d) => d.dispose()));

        return { stop, selectedConfigId, deviceCopy, telemetry };
    },
});

interface TelemetryItem {
    name: keyof DeviceHealthData;
    value: string;
}
</script>

<style lang="postcss" scoped>
   .online-status {
      --size: 1rem;
      height: var(--size);
      width: var(--size);
      border-radius: var(--size);
   }
</style>
