
<template>
   <div class="container h-100 shadow bg-white p-3">
      <div class="row">
         <div class="col">
            <div
               class="list-group"
               v-if="devices"
            >
               <div
                  v-for="d of devices"
                  :key="d.id"
               >
                  {{d.name}}
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { DeviceClient, DeviceWithStatus } from 'netled';
   import { defineComponent, ref } from 'vue';
   import { useRestClient } from '../../services';

   export default defineComponent({
      props: {
      },
      setup() {

         const restClient = useRestClient();
         const devicesClient = new DeviceClient(restClient);

         const devices = ref<DeviceWithStatus[]>();
         devicesClient.list(true).then(d => devices.value = d);

         return { devices };
      }
   });

</script>
