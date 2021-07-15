
<template>
   <div id="app-wrapper">
      <led-canvas id="convas"></led-canvas>
      <controls id="controls"></controls>
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
      return {};
   }
});

</script>
