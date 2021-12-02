<template>
   <span>{{ str }}</span>
</template>

<script lang="ts">
   import { defineComponent, computed, ref } from 'vue';
   import { formatDistance } from 'date-fns';

   export default defineComponent({
      props: {
         created: { type: Number, required: true },
      },
      setup(props) {
         const ago = ref<string | undefined>(calcAgo(props.created));

         const str = computed(() => {
            const d = new Date(props.created);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + (ago.value ? ` (${ago.value})` : '');
         });

         if (ago.value) {
            const timeout = () => Math.max(5000, (Date.now() - props.created) / 5);

            const runCalc = () => {
               ago.value = calcAgo(props.created);
               if (ago.value) {
                  setTimeout(runCalc, timeout());
               }
            };
            setTimeout(runCalc, timeout());
         }

         return { str };
      },
   });

   const oneDayAgo = 24 * 60 * 60 * 1000;

   function calcAgo(created: number): string | undefined {
      const now = new Date();
      if (now.getTime() - created > oneDayAgo) {
         return undefined;
      }
      return formatDistance(new Date(created), now, { addSuffix: true, includeSeconds: true });
   }
</script>
