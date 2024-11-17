
<template>
    <div class="container h-100 shadow bg-white p-3">
        <div class="row">
            <div
                class="col-sm-6 col-lg-4 col-xxl-3 text-decoration-none"
                v-for="d of devices"
                :key="d.id"
            >
                <device-list-item :device="d" :configs="configs"></device-list-item>
            </div>
        </div>

        <teleport to="#portal-header">
            <router-link
                class="btn btn-primary"
                :to="useRouteLocation(RouteName.DeviceAdd)"
            >
                New Device
            </router-link>
        </teleport>
    </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { useAnimationRestClient, useDevicesRestClient } from '../../services';
import DeviceListItem from './DeviceListItem.vue';
import { useRouteLocation, RouteName } from '$src/main.router';
import { deepClone } from '$core/services/deepClone';

export default defineComponent({
    components: {
        DeviceListItem
    },
    props: {
    },
    async setup() {

        const devicesClient = useDevicesRestClient();
        const animationClient = useAnimationRestClient();

        const devices = await devicesClient.list();
        const configs = deepClone(await animationClient.config.list()).sort((a, b) => a.name.localeCompare(b.name));

        return { devices, configs, useRouteLocation, RouteName };
    }
});

</script>
