<template>
   <div>{{ logs.length }}</div>
</template>

<script lang="ts">
   import { useRestClient } from '@/services';
   import { DeviceRestClient, Id } from '@krakerxyz/netled-core';
   import { defineComponent } from 'vue';

   export default defineComponent({
      props: {
         deviceId: { type: String as () => Id, required: true },
      },
      async setup(props) {
         const restClient = useRestClient();
         const deviceClient = new DeviceRestClient(restClient);

         const logs = await deviceClient.logs({ deviceIds: [props.deviceId] });

         return { logs };
      },
   });
</script>
