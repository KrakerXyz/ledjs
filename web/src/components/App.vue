
<template>
   <div id="app-wrapper" class="vh-100 bg-light d-flex flex-column">
      <div class="navbar navbar-expand navbar-dark bg-dark sticky-top">
         <div class="container">
            <div class="d-flex">
               <div class="collapse navbar-collapse">
                  <ul class="navbar-nav">
                     <li class="nav-item">
                        <router-link
                           class="nav-link"
                           :to="{ name: 'animation-list' }"
                        >
                           Animations
                        </router-link>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </div>

      <div class="flex-grow-1 position-relative overflow-hidden">
         <Suspense>
            <template #default>
               <router-view></router-view>
            </template>
            <template #fallback>
               <span>Loading...</span>
            </template>
         </Suspense>
      </div>
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
