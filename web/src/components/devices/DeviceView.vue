
<template>
   <div>
      View - {{device.name}}
   </div>
</template>

<script lang="ts">

   import { ref } from '@vue/reactivity';
   import { DeviceRestClient, DeviceWithStatus } from 'netled';
   import { defineComponent } from 'vue';
   import { useRestClient } from '../../services';

   export default defineComponent({
      props: {
         deviceId: { type: String, required: true }
      },
      async setup(props) {

         const device = ref<DeviceWithStatus>();

         const restClient = useRestClient();
         const deviceClient = new DeviceRestClient(restClient);
         device.value = await deviceClient.byId(props.deviceId, true);

         return { device };
      }
   });

</script>
