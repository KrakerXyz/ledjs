
<template>
   <div>
      View - {{device.name}}
   </div>
</template>

<script lang="ts">

   import { ref } from '@vue/reactivity';
   import { Device, DeviceRestClient } from 'netled';
   import { defineComponent } from 'vue';
   import { useRestClient } from '../../services';

   export default defineComponent({
      props: {
         deviceId: { type: String, required: true }
      },
      async setup(props) {

         const device = ref<Device>();

         const restClient = useRestClient();
         const deviceClient = new DeviceRestClient(restClient);
         device.value = await deviceClient.byId(props.deviceId);

         return { device };
      }
   });

</script>
