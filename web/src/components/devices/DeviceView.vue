
<template>
   <div class="container h-100 shadow bg-white p-3">
      <template v-if="device">
         <h1>{{device.name}}</h1>
         <div class="row">
            <div class="col">
               <div class="form-floating">
                  <textarea
                     id="device-config"
                     class="form-control font-monospace"
                     placeholder="*"
                     readonly
                     :value="dotEnv"
                  ></textarea>
                  <label for="device-config">.env</label>
               </div>
            </div>
         </div>
      </template>
   </div>
</template>

<script lang="ts">

   import { ref } from '@vue/reactivity';
   import { DeviceRestClient, Device } from 'netled';
   import { computed, defineComponent } from 'vue';
   import { useRestClient } from '../../services';

   export default defineComponent({
      props: {
         deviceId: { type: String, required: true }
      },
      async setup(props) {

         const device = ref<Device | null>(null);

         const restClient = useRestClient();
         const deviceClient = new DeviceRestClient(restClient);
         device.value = await deviceClient.byId(props.deviceId, true);

         const dotEnv = computed(() => {
            if (!device.value) { return ''; }
            return [
               `DEVICE_ID=${device.value.id}`,
               `DEVICE_SECRET=${device.value.secret}`
            ].join('\r\n');
         });

         return { device, dotEnv };
      }
   });

</script>

<style lang="postcss" scoped>
   textarea {
      height: 7rem !important;
   }
</style>
