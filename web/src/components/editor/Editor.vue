
<template>
   <div class="d-flex flex-column h-100">
      <div>
         <button class="btn btn-link p-0" @click="resetScript()">
            Reset Script
         </button>
      </div>
      <div id="editor-ide-container" class="flex-grow-1"></div>
      <div id="editor-status-container" class="mt-3 border border-dark"></div>
   </div>
</template>

<script lang="ts">

   import { defineComponent, onMounted, Ref, watch } from 'vue';
   import { useDefaultScript } from './defaultScript';
   import { useJavascriptLib } from './javascriptLib';
   import { useMonacoEditor } from './monacoEditor';

   export default defineComponent({
      props: {
      },
      setup() {

         const tmpScript = localStorage.getItem('tmp-script') ?? useDefaultScript();

         let content: Ref<string> | undefined;

         onMounted(() => {

            const { content: monacoContent } = useMonacoEditor('editor-ide-container', {
               javascriptLib: useJavascriptLib()
            });

            content = monacoContent;

            content.value = tmpScript;

            watch(content, c => {
               localStorage.setItem('tmp-script', c);
            })

         });

         const resetScript = () => {
            if (!content) { return; }
            content.value = useDefaultScript();
         }

         return { resetScript };
      }
   });

</script>

<style lang="postcss" scoped>
   #editor-status-container {
      min-height: 200px;
   }
</style>
