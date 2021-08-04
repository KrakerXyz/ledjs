
<template>
   <div class="container h-100 shadow bg-white p-3">
      <div class="row">
         <div class="col">
            {{status === 'initializing'? 'Logging in' : 'Login' }}
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { defineComponent, watch } from 'vue';
   import { useRoute, useRouter } from 'vue-router';
   import { useLoginService } from '../services';

   export default defineComponent({
      setup() {

         const loginService = useLoginService();
         const route = useRoute();
         const router = useRouter();

         watch(loginService.status, status => {
            if (status !== 'signedIn') { return; }
            const name = route.query.ret as string;
            if (!name) { return; }
            router.replace({ name });
         });

         return { ...loginService };
      }
   });

</script>
