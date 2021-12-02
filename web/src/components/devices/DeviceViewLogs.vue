<template>
   <div class="list-group overflow-auto">
      <div class="list-group-item" v-for="log of logs" :key="log.id">
         <div class="row">
            <div class="col-1 fw-bold">{{ log.type }}</div>
            <div class="col"><v-created class="text-muted small" :created="log.created"></v-created></div>
         </div>
         <div class="row mt-2">
            <div class="col font-monospace">{{ JSON.stringify(log.data) }}</div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">
   import { useRestClient, useWsClient } from '@/services';
   import { deepClone, DeviceRestClient, Disposable, FromDeviceMessageLog, Id, newId } from '@krakerxyz/netled-core';
   import { defineComponent, onUnmounted, reactive } from 'vue';

   export default defineComponent({
      props: {
         deviceId: { type: String as () => Id, required: true },
      },
      async setup(props) {
         const restClient = useRestClient();
         const deviceClient = new DeviceRestClient(restClient);

         const ws = useWsClient();

         const disposables: Disposable[] = [];
         onUnmounted(() => disposables.forEach((d) => d.dispose()));

         const logs = reactive(deepClone(await deviceClient.logs({ deviceIds: [props.deviceId] })));

         disposables.push(
            ws.on('deviceMessage', (d) => {
               if (d.deviceId !== props.deviceId) {
                  return;
               }

               logs.splice(0, 0, {
                  created: Date.now(),
                  id: newId(),
                  type: d.type,
                  data: d.data,
               } as FromDeviceMessageLog);
            })
         );

         return { logs };
      },
   });
</script>
