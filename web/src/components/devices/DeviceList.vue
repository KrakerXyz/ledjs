
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
                     <div class="col d-flex align-items-center">

                        <span
                           class="online-status d-inline-block me-2"
                           :class="{'bg-success': d.status.cameOnline > d.status.wentOffline, 'bg-danger': d.status.wentOffline >= d.status.cameOnline }"
                        ></span>

                        {{ d.name }}

                        <button
                           class="btn p-0 ms-2 text-success"
                           v-if="d.status.animation && d.status.isStopped"
                           @click.prevent="stop(d, false)"
                        >
                           <i class="fas fa-play fa-fw"></i>
                        </button>

                        <span
                           class="btn p-0 ms-2 text-danger"
                           v-if="d.status.animation && !d.status.isStopped"
                           @click.prevent="stop(d, true)"
                        >
                           <i class="fas fa-stop fa-fw"></i>
                        </span>

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

   import { DeviceRestClient, Device } from 'netled';
   import { defineComponent, reactive, ref } from 'vue';
   import { useRestClient } from '../../services';

   export default defineComponent({
      props: {
      },
      setup() {

         const restClient = useRestClient();
         const devicesClient = new DeviceRestClient(restClient);

         const devices = ref<Device[]>();
         devicesClient.list(true).then(d => devices.value = reactive(d));

         const stop = (device: Device, value: boolean) => {
            devicesClient.stopAnimation({ deviceIds: [device.id], stop: value });
            device.status.isStopped = value;
         };

         return { devices, stop };
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