
<template>
   <div class="d-flex flex-column h-100">
      <div id="editor-ide-container" class="flex-grow-1"></div>
      <div id="editor-status-container" class="mt-3 border border-dark p-2">
         <div class="row">
            <div class="col">
               <div class="list-group" v-if="errorMessages.length">
                  <div
                     class="list-group-item bg-danger text-white"
                     v-for="(e, i) of errorMessages"
                     :key="i"
                  >
                     {{ e }}
                  </div>
               </div>
               <div v-else>No errors</div>
            </div>
            <div class="col">
               <button class="btn btn-link p-0 me-3" @click="resetScript()">
                  Reset Script
               </button>
               <button class="btn btn-link p-0" @click="testScript()">
                  Test script
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { computed, defineComponent, watch } from 'vue';
   import { useDefaultScript } from './defaultScript';
   import { useIframeRunner } from './iframeRunner';
   import { useJavascriptLib } from './javascriptLib';
   import { useMonacoEditor } from './monacoEditor';
   import { parseScript } from 'netled';

   export default defineComponent({
      props: {
      },
      setup() {

         const tmpScript = localStorage.getItem('tmp-script') ?? useDefaultScript();

         const { content, errorMarkers: monacoErrorMarkers } = useMonacoEditor('editor-ide-container', {
            javascriptLib: useJavascriptLib()
         });

         content.value = tmpScript;

         watch(content, c => {
            localStorage.setItem('tmp-script', c);
         });

         const errorMessages = computed(() => {
            const set = new Set(monacoErrorMarkers.value.map(x => x.message));
            return [...set];
         });

         const scriptParseResult = computed(() => parseScript(content.value));
         watch(scriptParseResult, r => {
            //console.log('parseResult', r);
         });

         const resetScript = () => {
            if (!content) { return; }
            content.value = useDefaultScript();
         }

         const testScript = async () => {
            if (!content?.value?.trim()) { return; }

            const frameContext = await useIframeRunner(content.value);

            const frame = await frameContext.nextFrame();
            console.log('Got frame', frame);

         }

         return { resetScript, testScript, errorMessages };
      }
   });

</script>

<style lang="postcss" scoped>
   #editor-status-container {
      min-height: 200px;
      overflow-y: auto;
      overflow-x: hidden;
   }
</style>
