
<template>
   <div class="container h-100 shadow bg-white p-3">

      <div class="row">
         <div class="col-md-6 mb-3">
            <div class="form-floating">
               <input
                  id="device-name"
                  class="form-control"
                  placeholder="*"
                  v-model="devicePost.name"
               >
               <label for="device-name">Device Name</label>
            </div>
         </div>
         <div class="col-md-6 mb-3">
            <div class="form-floating">
               <input
                  id="device-name"
                  class="form-control"
                  placeholder="*"
                  v-model="devicePost.numLeds"
               >
               <label for="device-name">Number of Leds</label>
            </div>
         </div>
      </div>

      <div class="row">
         <div class="col-md-3">
            <button
               class="btn btn-primary w-100"
               @click.once="save()"
            >
               Add
            </button>
         </div>
      </div>

   </div>
</template>

<script lang="ts">

   import { reactive } from '@vue/reactivity';
   import { DeviceRestClient, DevicePost } from 'netled';
   import { v4 } from 'uuid';
   import { defineComponent } from 'vue';
   import { useRouter } from 'vue-router';
   import { useRestClient } from '../../services';

   export default defineComponent({
      setup() {

         const devicePost: DevicePost = reactive({
            id: v4(),
            name: '',
            numLeds: 0
         });

         const restClient = useRestClient();
         const router = useRouter();
         const save = async () => {
            const deviceClient = new DeviceRestClient(restClient);
            await deviceClient.save(devicePost);
            router.replace({ name: 'device-view', params: { deviceId: devicePost.id } });
         };

         return { devicePost, save };
      }
   });

</script>
