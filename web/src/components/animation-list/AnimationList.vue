
<template>
   <div class="container h-100 shadow bg-white p-3">
      <div class="list-group" v-if="animations">
         <router-link
            class="list-group-item list-group-item-action"
            v-for="a of animations"
            :key="a.id"
            :to="{ name: 'config', params: { animationId: a.id } }"
         >
            {{ a.name }}
            <div v-if="a.description">{{ a.description }}</div>
         </router-link>
      </div>
   </div>
</template>

<script lang="ts">

   import { AnimationClient, AnimationMeta } from 'netled';
   import { defineComponent, ref } from 'vue';
   import { useRestClient } from '../../services';

   export default defineComponent({
      props: {
      },
      setup() {

         const restClient = useRestClient();
         const animationClient = new AnimationClient(restClient);

         const animations = ref<AnimationMeta[]>();
         animationClient.all().then(a => animations.value = a);

         return { animations };
      }
   });

</script>
