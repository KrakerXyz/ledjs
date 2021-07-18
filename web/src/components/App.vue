
<template>
   <div id="app-wrapper" class="">
      <led-canvas id="convas"></led-canvas>
      <controls id="controls" class="border border-dark shadow p-3"></controls>
   </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import Controls from './Controls.vue';
import LedCanvas from './LedCanvas.vue';

export default defineComponent({
   components: {
      LedCanvas,
      Controls
   },
   setup() {

      //fetch('/api').then(r => r.json()).then(r => console.log('Success', r));

      // setInterval(() => {
      //    console.log('Starting WS');
      //    const ws = new WebSocket(`ws://${window.location.host}/api/ws`);

      //    ws.addEventListener('open', e => {
      //       console.log('WS opened', e);
      //       ws.send('Hello server');
      //    });

      //    ws.addEventListener('message', e => {
      //       console.log('Got ws message', e);
      //    });

      //    setTimeout(() => {
      //       console.log('Disconnecting WS');
      //       ws.close();
      //    }, 3000);

      // }, 10000);

      return {};
   }
});

</script>

<style lang="postcss" scoped>
#app-wrapper {
   --control-padding: 120px;
}

#controls {
   position: absolute;
   top: var(--control-padding);
   left: var(--control-padding);
   width: calc(100vw - var(--control-padding) * 2);
   height: calc(100vh - var(--control-padding) * 2);
}
</style>
