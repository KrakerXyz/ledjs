
<template>
   <div id="editor-ide-container" class="h-100 border"></div>
</template>

<script lang="ts">

   import { defineComponent, onMounted } from 'vue';
   import type * as monaco from 'monaco-editor';

   export default defineComponent({
      props: {
      },
      setup() {

         onMounted(() => {

            (window as any).require(['vs/editor/editor.main'], function () {

               const thisMonaco: typeof monaco = (window as any).monaco;

               const editor = thisMonaco.editor.create(document.getElementById('editor-ide-container'), {
                  value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
                  language: 'javascript',
                  renderValidationDecorations: 'on',
                  theme: 'vs-dark'
               }) as monaco.editor.IStandaloneCodeEditor
            })
         })

         return {};
      }
   });

</script>
