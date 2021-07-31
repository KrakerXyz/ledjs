
<template>
   <div class="container h-100 shadow bg-white p-3">

      <div class="row">
         <div class="col">
            <div
               class="list-group"
               v-if="devices"
            >
               <router-link
                  class="list-group-item list-group-item-action"
                  v-for="d of devices"
                  :key="d.id"
                  :to="{ name: 'device-view', params: { deviceId: d.id } }"
               >
                  <div class="row">
                     <div class="col">
                        {{ d.name }}
                     </div>
                  </div>
               </router-link>
            </div>
         </div>
      </div>

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

   import { DeviceRestClient, DeviceWithStatus } from 'netled';
   import { defineComponent, ref } from 'vue';
   import { useRestClient } from '../../services';

   export default defineComponent({
      props: {
      },
      setup() {

         const restClient = useRestClient();
         const devicesClient = new DeviceRestClient(restClient);

         const devices = ref<DeviceWithStatus[]>();
         devicesClient.list(true).then(d => devices.value = d);

         return { devices };
      }
   });

</script>
