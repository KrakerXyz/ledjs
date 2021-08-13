
<template>
    <div class="card">
        <div class="card-header">
            <div class="row">
                <div class="col">
                    <div class="card-title d-flex align-items-center">
                        <span
                            class="online-status d-inline-block me-2"
                            :class="{ 'bg-success': deviceCopy.status.cameOnline > deviceCopy.status.wentOffline, 'bg-danger': deviceCopy.status.wentOffline >= deviceCopy.status.cameOnline }"
                        ></span>
                        {{ deviceCopy.name }}
                    </div>
                </div>
                <div class="col-auto">
                    <button
                        class="btn p-0 ms-2 text-success"
                        v-if="deviceCopy.isStopped"
                        @click.prevent="stop(deviceCopy, false)"
                    >
                        <i class="fas fa-play fa-fw"></i>
                    </button>

                    <button
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
                    <option value>None</option>
                    <option
                        v-for="c of configs"
                        :key="c.id"
                        :value="c.id"
                    >{{ c.animationName }} - {{ c.name }}</option>
                </select>
                <label for="device-animation">Animation</label>
            </div>
        </div>

        <!-- <div class="row">
            <div class="col d-flex align-items-center">
                <span
                    class="online-status d-inline-block me-2"
                    :class="{ 'bg-success': device.status.cameOnline > device.status.wentOffline, 'bg-danger': device.status.wentOffline >= device.status.cameOnline }"
                ></span>
                {{ device.name }}
                <button
                    class="btn p-0 ms-2 text-success"
                    v-if="device.isStopped"
                    @click.prevent="stop(device, false)"
                >
                    <i class="fas fa-play fa-fw"></i>
                </button>

                <span
                    class="btn p-0 ms-2 text-danger"
                    v-if="!device.isStopped"
                    @click.prevent="stop(device, true)"
                >
                    <i class="fas fa-stop fa-fw"></i>
                </span>
            </div>
        </div>-->
    </div>
</template>

<script lang="ts">

import { useDevicesRestClient } from '@/services';
import { AnimationNamedConfigSummary, deepClone, Device, Id } from 'netled';
import { computed, defineComponent, reactive } from 'vue';

export default defineComponent({
    props: {
        device: { type: Object as () => Device, required: true },
        configs: { type: Array as () => AnimationNamedConfigSummary[], required: true }
    },
    setup(props) {

        const devicesClient = useDevicesRestClient();

        const deviceCopy = reactive(deepClone(props.device));

        const selectedConfigId = computed({
            get() {
                return deviceCopy.animationNamedConfigId ?? '';
            },
            set(configId: string) {
                devicesClient.setAnimationConfig({
                    deviceIds: [props.device.id],
                    configId: configId as Id || null
                });
            }
        });

        const stop = (device: Device, value: boolean) => {
            devicesClient.stopAnimation({ deviceIds: [device.id], stop: value });
            //Need to clone and make the in-memory devices writeable
            deviceCopy.isStopped = value;
        };

        return { stop, selectedConfigId, deviceCopy };
    }
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