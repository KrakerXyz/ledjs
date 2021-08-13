
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
            <router-link :to="{ name: 'device-add' }">New Device Registration</router-link>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

import { deepClone } from 'netled';
import { defineComponent } from 'vue';
import { useAnimationRestClient, useDevicesRestClient, useWsClient } from '../../services';
import DeviceListItem from './DeviceListItem.vue';

export default defineComponent({
   components: {
      DeviceListItem
   },
   props: {
   },
   async setup() {

      const wsClient = useWsClient();
      const devicesClient = useDevicesRestClient();
      const animationClient = useAnimationRestClient();

      const devices = await devicesClient.list(true);
      const configs = deepClone(await animationClient.config.list()).sort((a, b) => a.name.localeCompare(b.name));

      wsClient.onDeviceConnectionEvent((did, data) => {
         const device = devices.find(d => d.id === did);
         if (!device) { return; }
         if (data.state === 'connected') {
            (device.status as any).cameOnline = Date.now();
         } else {
            (device.status as any).wentOffline = Date.now();
         }
      });

      return { devices, configs };
   }
});

</script>
