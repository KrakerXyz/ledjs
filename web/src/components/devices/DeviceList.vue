
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

        <!--:to="{ name: 'device-view', params: { deviceId: d.id } }"-->

        <div class="row mt-3">
            <div class="col">
                <router-link :to="{ name: 'device-add' }">
                    New Device Registration
                </router-link>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { deepClone } from '@krakerxyz/netled-core';
import { defineComponent } from 'vue';
import { useAnimationRestClient, useDevicesRestClient } from '../../services';
import DeviceListItem from './DeviceListItem.vue';

export default defineComponent({
    components: {
        DeviceListItem
    },
    props: {
    },
    async setup() {

        const devicesClient = useDevicesRestClient();
        const animationClient = useAnimationRestClient();

        const devices = await devicesClient.list(true);
        const configs = deepClone(await animationClient.config.list()).sort((a, b) => a.name.localeCompare(b.name));

        return { devices, configs };
    }
});

</script>
