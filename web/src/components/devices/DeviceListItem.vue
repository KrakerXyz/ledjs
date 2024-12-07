<template>
    <div class="row d-flex align-items-center">
        <div class="col-auto">
            <button
                v-if="!deviceCopy.isRunning"
                @click="setRunning(true)"
                type="button"
                class="btn btn-success"
            >
                <v-icon :icon="Icons.Play"></v-icon>
            </button>
            <button
                v-if="deviceCopy.isRunning"
                @click="setRunning(false)"
                type="button"
                class="btn btn-danger"
            >
                <v-icon :icon="Icons.Stop"></v-icon>
            </button>
        </div>
        <div class="col-auto">
            <router-link :to="useRouteLocation(RouteName.DeviceView, { deviceId: deviceCopy.id })" class="text-body">
                {{ deviceCopy.name || '[Name Missing]' }}
            </router-link>
        </div>
        <div class="col-4">
            <div class="form-floating">
                <select
                    id="device-strand"
                    class="form-select"
                    placeholder="*"
                    v-model="selectedStrandId"
                >
                    <option value>
                        None
                    </option>
                    <option v-for="c of strands" :key="c.id" :value="c.id">
                        {{ c.name }}
                    </option>
                </select>
                <label for="device-animation">Strand</label>
            </div>
        </div>
        <div class="col"></div>
        <div class="col-auto">
            <span
                class="online-status d-inline-block me-2"
                :class="{
                    'bg-success': isOnline,
                    'bg-danger': !isOnline,
                }"
            ></span>
        </div>
    </div>
</template>

<script lang="ts">
import type { Device } from '$core/rest/model/Device.js';
import { deepClone } from '$core/services/deepClone';
import { assertTrue, restApi } from '$src/services';
import { watch, defineComponent, reactive, ref, getCurrentInstance } from 'vue';
import { useRouteLocation, RouteName } from '$src/main.router';
import { Icons } from '$src/components/global/Icon.vue';
import { useMqttClient } from '$src/services/mqttClient';
import { ScriptConfigSummary } from '$core/rest/model/ScriptConfig';

export default defineComponent({
    props: {
        device: { type: Object as () => Device, required: true },
        configs: { type: Array as () => ScriptConfigSummary[], required: true },
    },
    async setup(props) {
        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const mqtt = useMqttClient();
        const isOnline = ref(false);
        let offlineTimeout: number | null = null;
        mqtt.subscribe(`status/${props.device.id}`, () => {
            isOnline.value = true;
            if (offlineTimeout) {
                clearTimeout(offlineTimeout);
            }
            offlineTimeout = setTimeout(() => {
                isOnline.value = false;
                offlineTimeout = null;
            }, 17_000) as unknown as number;
        });

        const deviceCopy = reactive(deepClone(props.device));

        const selectedStrandId = ref(deviceCopy.strandId);
        watch(selectedStrandId, (newVal) => {
            deviceCopy.strandId = newVal;
            restApi.devices.setStrand(deviceCopy.id, newVal);
        });

        const strands = await restApi.strands.list();

        const setRunning = (running: boolean) => {
            deviceCopy.isRunning = running;
            restApi.devices.setRunning(deviceCopy.id, running);
        };

        return { stop, selectedStrandId, deviceCopy, useRouteLocation, RouteName, strands, Icons, setRunning, isOnline };
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
