<template>
   <div class="container h-100 shadow bg-white p-3">
      <h1>{{ animation.name }} Configs</h1>
      <div class="row">
         <div class="col">
            <div class="list-group" v-if="configs">
               <router-link
                  class="list-group-item list-group-item-action"
                  v-for="c of configs"
                  :key="c.id"
                  :to="{ name: 'animation-config', params: { configId: c.id } }"
               >
                  <div class="row">
                     <div class="col">
                        {{ c.name }}
                        <div v-if="c.description">{{ c.description }}</div>
                     </div>
                  </div>
               </router-link>
            </div>
         </div>
      </div>
      <div class="row mt-3">
         <div class="col">New Config</div>
      </div>
   </div>
</template>

<script lang="ts">
import { useRestClient } from '@/services';
import { AnimationNamedConfigPost, AnimationRestClient, Id } from 'netled';
import { v4 } from 'uuid';
import { defineComponent } from 'vue';

export default defineComponent({
   props: {
      animationId: { type: String as () => Id, required: true },
      version: { type: Number, required: true },
   },
   async setup(props) {
      const restClient = useRestClient();
      const animationRestClient = new AnimationRestClient(restClient);

      const animationProm = animationRestClient.byId(
         props.animationId,
         props.version
      );
      const configs = await animationRestClient.config.list(
         props.animationId,
         props.version
      );

      const animation = await animationProm;

      if (!configs.length) {
         const newConfig: AnimationNamedConfigPost = {
            id: v4() as Id,
            name: 'Default',
            animation: {
               id: props.animationId,
               version: props.version,
               interval: 33,
               brightness: 0.5,
            },
         };
         console.log(newConfig);
         await animationRestClient.config.save(newConfig);
      }

      return { configs, animation };
   },
});
</script>
