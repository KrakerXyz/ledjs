
<template>
   <div id="app-wrapper" class="vh-100">
      <router-view></router-view>
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