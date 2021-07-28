
<template>
   <div class="container h-100 shadow bg-white p-3">
      <div class="row">
         <div class="col">
            <div
               class="list-group"
               v-if="animations"
            >
               <router-link
                  class="list-group-item list-group-item-action"
                  v-for="a of animations"
                  :key="a.id"
                  :to="{ name: 'config', params: { animationId: a.id } }"
               >
                  <div class="row">
                     <div class="col">
                        {{ a.name }}
                        <div v-if="a.description">{{ a.description }}</div>
                     </div>
                     <div class="col-auto d-flex align-items-center">
                        <router-link :to="{ name: 'editor', params: { animationId: a.id } }">
                           <i class="fal fa-edit"></i>
                        </router-link>
                     </div>
                  </div>
               </router-link>
            </div>
         </div>
      </div>

      <div class="row">
         <div class="col text-end">
            <router-link :to="{ name: 'editor', params: { animationId: 'new' } }">
               New Animation
            </router-link>
         </div>
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
         animationClient.list().then(a => animations.value = a);

         return { animations };
      }
   });

</script>
