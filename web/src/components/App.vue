
<template>
   <div
      id="app-wrapper"
      class="vh-100 bg-light d-flex flex-column"
   >
      <div class="navbar navbar-expand navbar-dark bg-dark sticky-top">
         <div class="container">
            <ul class="navbar-nav">
               <li class="nav-item">
                  <router-link
                     class="nav-link"
                     :to="{name: 'home'}"
                  >
                     Home
                  </router-link>
               </li>
               <template v-if="isLoggedIn">
                  <li class="nav-item">
                     <router-link
                        class="nav-link"
                        :to="{ name: 'animation-list' }"
                     >
                        Animations
                     </router-link>
                  </li>
                  <li class="nav-item">
                     <router-link
                        class="nav-link"
                        :to="{ name: 'device-list' }"
                     >
                        Devices
                     </router-link>
                  </li>
               </template>
            </ul>
            <ul class="navbar-nav">
               <li class="nav-item">
                  <user></user>
               </li>
            </ul>
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

   import { computed, defineComponent } from 'vue';
   import { useRouter } from 'vue-router';
   import { useLoginService } from '../services';
   import User from './User.vue';

   export default defineComponent({
      components: {
         User
      },
      setup() {
         const router = useRouter();
         const loginService = useLoginService(() => router);

         const isLoggedIn = computed(() => loginService.status.value === 'signedIn');

         return { isLoggedIn };
      }
   });

</script>
