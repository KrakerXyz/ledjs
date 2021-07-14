
<template>
   <div>
      <led-canvas></led-canvas>
   </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import LedCanvas from './LedCanvas.vue';

export default defineComponent({
   components: {
      LedCanvas
   },
   setup() {
      return {};
   }
});

</script>
