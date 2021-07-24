
<template>
   <div class="h-100">
      <led-canvas id="canvas" :frame="frame"></led-canvas>

      <div id="controls" class="row border border-dark shadow g-0">
         <!-- The positioning here was to get monaco to resize to fill the col. -->
         <div class="col position-relative">
            <div
               id="editor-ide-container"
               class="h-100 w-100 position-absolute"
            ></div>
         </div>

         <div class="col-auto col-right p-1">
            <div class="list-group" v-if="errorMessages.length">
               <div
                  class="list-group-item bg-danger text-white p-1"
                  v-for="(e, i) of errorMessages"
                  :key="i"
               >
                  <small>{{ e }}</small>
               </div>
            </div>

            <template v-else>
               <button
                  v-if="!isRunning"
                  class="btn btn-link p-0 ms-3"
                  @click="testScript()"
               >
                  Test script
               </button>
               <button
                  v-if="isRunning"
                  class="btn btn-link p-0 ms-3"
                  @click="stopScript()"
               >
                  Stop script
               </button>
               <button class="btn btn-link p-0 ms-3" @click="test()">
                  Test
               </button>

               <div class="row mt-3">
                  <div class="col">
                     <div class="form-floating">
                        <input
                           id="editor-script-name"
                           class="form-control"
                           placeholder="*"
                           v-model.trim="animationPost.name"
                        />
                        <label for="editor-script-name">Animation Name</label>
                     </div>
                  </div>
               </div>

               <div class="row mt-3">
                  <div class="col">
                     <div class="form-floating">
                        <textarea
                           id="editor-script-description"
                           class="form-control"
                           placeholder="*"
                           v-model.trim="animationPost.description"
                        ></textarea>
                        <label for="editor-script-description">
                           Description
                        </label>
                     </div>
                  </div>
               </div>

               <div class="row mt-2">
                  <div class="col">
                     <button
                        class="btn btn-primary w-100"
                        @click="saveScript()"
                     >
                        Save Draft
                     </button>
                  </div>
               </div>
            </template>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { computed, defineComponent, reactive, ref, watch } from 'vue';
   import { useDefaultScript } from './defaultScript';
   import { IFrameContext, useIframeRunner } from './iframeRunner';
   import { useJavascriptLib } from './javascriptLib';
   import { useMonacoEditor } from './monacoEditor';
   import { AnimationClient, AnimationPost, parseScript } from 'netled';
   import { useRestClient } from '../../services';
   import LedCanvas from '../LedCanvas.vue';
   import { Frame } from '../../color-utilities';

   export default defineComponent({
      components: {
         LedCanvas
      },
      setup() {

         const tmpScript = localStorage.getItem('tmp-script') ?? useDefaultScript();

         const { content } = useMonacoEditor('editor-ide-container', {
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

         const frame = ref<Frame>([]);
         const iframeContext = ref<IFrameContext>();
         const isRunning = computed(() => !!iframeContext.value);
         let intervalTimeout: number | undefined | null;

         const testScript = async () => {
            if (!content?.value?.trim()) { return; }

            iframeContext.value = await useIframeRunner(content.value);
            iframeContext.value.setNumLeds(144);

            frame.value = [...await iframeContext.value.nextFrame()];

            intervalTimeout = setInterval(async () => {
               frame.value = [...await iframeContext.value.nextFrame()];
            }, 50);

         }

         const stopScript = () => {
            if (!iframeContext.value) { return; }
            iframeContext.value.dispose();
            iframeContext.value = null;
            frame.value = [];
            if (intervalTimeout) { clearInterval(intervalTimeout); intervalTimeout = null; }
         }

         const restClient = useRestClient();
         const animationClient = new AnimationClient(restClient);

         const animationPost: AnimationPost = reactive({
            id: '768e6520-3f0c-4fb8-8a16-1de5f6fc3577',
            script: content.value,
            name: '',
            description: ''
         });

         watch(content, s => animationPost.script = s);

         const saveScript = async () => {
            await animationClient.post(animationPost);
            console.log('Saved animation');
         }

         const test = () => {
            //
         }

         return { testScript, errorMessages, saveScript, test, frame, animationPost, isRunning, stopScript };
      }
   });

</script>

<style lang="postcss" scoped>
   #controls {
      --control-padding: 120px;
      position: absolute;
      top: var(--control-padding);
      left: var(--control-padding);
      width: calc(100vw - var(--control-padding) * 2);
      height: calc(100vh - var(--control-padding) * 2);
   }

   .col-right {
      width: 200px;
   }

   #editor-script-description {
      height: 200px;
   }
</style>
