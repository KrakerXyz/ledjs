<template>
    <div class="container h-100 shadow bg-white p-3">
        <div class="row">
            <div class="col-md-auto mb-3">
                <div class="form-floating">
                    <input
                        id="device-name"
                        class="form-control"
                        placeholder="*"
                        v-model="devicePost.name"
                    />
                    <label for="device-name">Device Name</label>
                </div>
            </div>
            <div class="col-md-auto mb-3">
                <div class="form-floating">
                    <input
                        id="device-name"
                        class="form-control"
                        placeholder="*"
                        v-model="devicePost.spiSpeed"
                    />
                    <label for="device-name">LED Speed</label>
                    <small class="form-text">The speed in MHz that the LEDs are capable of running at</small>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-3">
                <button type="button" class="btn btn-primary w-100" @click.once="save()">
                    Add
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useRestClient } from '../../services';
import { type DevicePost, DeviceRestClient } from '$core/rest/DeviceRestClient';
import { newId } from '$core/services/newId';
import { RouteName, useRouteLocation } from '$src/main.router';

export default defineComponent({
    setup() {
        const devicePost: DevicePost = reactive({
            id: newId(),
            name: 'New Device',
            spiSpeed: 25,
        });

        const restClient = useRestClient();
        const router = useRouter();
        const save = async () => {
            const deviceClient = new DeviceRestClient(restClient);
            await deviceClient.save(devicePost);
            router.replace(useRouteLocation(RouteName.DeviceView, { deviceId: devicePost.id }));
        };

        return { devicePost, save };
    },
});
</script>
