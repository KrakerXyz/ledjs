
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
               <button class="btn btn-link p-0" @click="resetScript()">
                  Reset Script
               </button>
               <button class="btn btn-link p-0 ms-3" @click="testScript()">
                  Test script
               </button>
               <button class="btn btn-link p-0 ms-3" @click="saveScript()">
                  Save script
               </button>
               <button class="btn btn-link p-0 ms-3" @click="test()">
                  Test
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
   import { AnimationClient, AnimationPost, parseScript } from 'netled';
   import { useRestClient } from '../../services';

   declare var require: any;

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

         const scriptParseResult = computed(() => parseScript(content.value));

         const errorMessages = computed(() => {
            if (scriptParseResult.value.valid === false) { return scriptParseResult.value.errors }
            return [];
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

         const restClient = useRestClient();
         const animationClient = new AnimationClient(restClient);
         const saveScript = async () => {
            const post: AnimationPost = {
               id: '768e6520-3f0c-4fb8-8a16-1de5f6fc3577',
               script: content.value,
               name: 'Test',
               description: 'The description'
            };
            await animationClient.post(post);
            console.log('Saved animation');
         }

         const test = () => {
            const blob = new Blob([content.value], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            import(/* @vite-ignore */ url).then(s => {
               if (!s.default) { throw new Error('default not found'); }
               const instance = new s.default();
               if (!instance.nextFrame) { throw new Error('nextFrame not found'); }
               console.log('It checks out');
            });
         }

         return { resetScript, testScript, errorMessages, saveScript, test };
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
