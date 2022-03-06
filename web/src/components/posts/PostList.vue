
<template>
   <div class="container h-100 shadow bg-white p-3">
      <teleport to="#portal-header">
         <router-link
            class="btn btn-primary"
            :to="useRoute(RouteName.PostEditor, { postId: 'new' })"
         >
            New Post Processor
         </router-link>
      </teleport>
   </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { useRoute, RouteName } from '@/main.router';

export default defineComponent({
    props: {
    },
    setup() {
        return { useRoute, RouteName };
    }
});

</script>
