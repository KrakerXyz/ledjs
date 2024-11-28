<template>
    <div class="container-fluid p-3">
        <div class="row">
            <div class="col">
                <div class="list-group" v-if="devices">
                    <div class="list-group-item list-group-item-action" v-for="d of devices" :key="d.id">
                        <device-list-item :device="d" :configs="configs"></device-list-item>
                    </div>
                </div>
            </div>
        </div>
        <teleport to="#portal-header">
            <router-link class="btn btn-primary" :to="useRouteLocation(RouteName.DeviceAdd)">
                New Device
            </router-link>
        </teleport>
    </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import DeviceListItem from './DeviceListItem.vue';
import { useRouteLocation, RouteName } from '$src/main.router';
import { deepClone } from '$core/services/deepClone';
import { restApi } from '$src/services';

export default defineComponent({
    components: {
        DeviceListItem
    },
    props: {
    },
    async setup() {

        const devices = await restApi.devices.list();
        const configs = deepClone(await restApi.animations.config.list()).sort((a, b) => a.name.localeCompare(b.name));

        return { devices, configs, useRouteLocation, RouteName };
    }
});

</script>
