
<template>
   <div class="d-flex flex-column h-100">
      <div>
         <button class="btn btn-link p-0 me-3" @click="resetScript()">
            Reset Script
         </button>
         <button class="btn btn-link p-0" @click="testScript()">
            Test script
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

         const testScript = () => {
            if (!content?.value?.trim()) { return; }

            //We'll need to create a postMessage here because to call the fn directly, we need to add allow-same-origin to sandbox but this also allows the script to access parent frame

            const srcdoc = `<html><body><script>window.fn = () => { console.log('Inside iframe fn'); }<\/script><\/body><\/html>`;

            (window as any).myfn = () => console.log('bad!');

            const iframe = document.createElement('iframe');
            iframe.srcdoc = srcdoc;
            iframe.sandbox.add('allow-scripts');
            iframe.style.display = 'none';

            document.body.appendChild(iframe);

            iframe.onload = () => {
               console.log('iframe loaded');
               (iframe.contentWindow as any).fn();
               iframe.remove();
            }

         }

         return { resetScript, testScript };
      }
   });

</script>

<style lang="postcss" scoped>
   #editor-status-container {
      min-height: 200px;
   }
</style>
