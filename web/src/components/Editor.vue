
<template>
   <div id="editor-ide-container" class="h-100"></div>
</template>

<script lang="ts">

   import { defineComponent, onMounted } from 'vue';

   import * as monaco from 'monaco-editor'

   //Ignoring errors due to ?worker. Still seems to work ok.
   //IF we get errors in prod about window being undefined, see https://stackoverflow.com/questions/65953675/import-monaco-editor-using-vite-2
   import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
   import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
   import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
   import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
   import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

   (self as any).MonacoEnvironment = {
      getWorker(_, label) {
         if (label === 'json') {
            return new jsonWorker()
         }
         if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker()
         }
         if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker()
         }
         if (label === 'typescript' || label === 'javascript') {
            return new tsWorker()
         }
         return new editorWorker()
      }
   }

   export default defineComponent({
      props: {
      },
      setup() {

         onMounted(() => {
            try {
               const editor = monaco.editor.create(document.getElementById('editor-ide-container'), {
                  value: "function hello() {\n\talert('Hello world!');\n}",
                  language: 'javascript'
               });

            } catch (e) {
               document.getElementById('editor-ide-container').innerText = 'Error starting manaco';
            }
         });

         return {};
      }
   });

</script>
