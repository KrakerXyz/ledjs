<template>
    <div class="card h-100">
        <div class="card-header">
            <div class="row">
                <div class="col">
                    <div class="card-title d-flex align-items-center">
                        <span
                            class="online-status d-inline-block me-2"
                            :class="{
                                'bg-success': (deviceCopy.status?.onlineSince ?? 0) > (deviceCopy.status?.offlineSince ?? 0),
                                'bg-danger': (deviceCopy.status?.offlineSince ?? 0) >= (deviceCopy.status?.onlineSince ?? 0),
                            }"
                        ></span>

                        <router-link :to="useRouteLocation(RouteName.DeviceView, { deviceId: deviceCopy.id })" class="text-body">
                            {{ deviceCopy.name || '[Name Missing]' }}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div class="card-body">
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
    </div>
</template>

<script lang="ts">
import type { Device } from '$core/rest/DeviceRestClient';
import type { AnimationConfigSummary } from '$core/rest/model/AnimationConfig';
import { deepClone } from '$core/services/deepClone';
import { assertTrue, restApi } from '$src/services';
import { watch, defineComponent, reactive, ref, getCurrentInstance } from 'vue';
import { useRouteLocation, RouteName } from '$src/main.router';

export default defineComponent({
    props: {
        device: { type: Object as () => Device, required: true },
        configs: { type: Array as () => AnimationConfigSummary[], required: true },
    },
    async setup(props) {
        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const deviceCopy = reactive(deepClone(props.device));

        const selectedStrandId = ref(deviceCopy.strandId);
        watch(selectedStrandId, (newVal) => {
            deviceCopy.strandId = newVal;
            restApi.devices.setStrand(deviceCopy.id, newVal);
        });

        const strands = await restApi.strands.list();

        return { stop, selectedStrandId, deviceCopy, useRouteLocation, RouteName, strands };
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
