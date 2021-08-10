
<template>
   <div class="h-100 d-flex flex-column">
      <led-canvas
         id="canvas"
         class="bg-secondary"
         :frame="frame"
         @drawError="onDrawError($event)"
      />

      <div class="flex-grow-1 container shadow bg-white p-3">
         <div class="row g-0 h-100">
            <!-- The positioning here was to get monaco to resize to fill the col. -->
            <div class="col position-relative">
               <div
                  id="editor-ide-container"
                  class="h-100 w-100 position-absolute"
               />
            </div>

            <div class="col-auto col-right p-1">

               <button
                  v-if="!isRunning"
                  class="btn btn-link p-0"
                  @click="testScript()"
               >
                  Test script
               </button>

               <div
                  v-if="executionError"
                  class="alert alert-danger px-1 py-0 mt-2 small"
               >
                  {{executionError}}
               </div>

               <button
                  v-if="isRunning"
                  class="btn btn-link p-0"
                  @click="stopScript()"
               >
                  Stop script
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
                        />
                        <label for="editor-script-description">
                           Description
                        </label>
                     </div>
                  </div>
               </div>

               <div
                  v-if="!executionError && !errorMessages.length"
                  class="row mt-2"
               >
                  <div class="col">
                     <button
                        class="btn btn-primary w-100"
                        @click="saveScript()"
                     >
                        Save Draft
                     </button>
                  </div>
               </div>

               <div
                  class="mt-3"
                  v-if="errorMessages.length"
               >
                  <div
                     class="alert alert-danger px-1 py-0 small"
                     v-for="(e, i) of errorMessages"
                     :key="i"
                  >
                     <small>{{ e }}</small>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script lang="ts">

   import { computed, defineComponent, getCurrentInstance, onUnmounted, reactive, ref, watch } from 'vue';
   import { useDefaultScript } from './defaultScript';
   import { IFrameContext, useIframeRunner } from './iframeRunner';
   import { useJavascriptLib } from './javascriptLib';
   import { useMonacoEditor } from './monacoEditor';
   import { Animation, AnimationRestClient, AnimationPost, Frame, parseScript, deepClone } from 'netled';
   import { useRestClient } from '../../../services';
   import LedCanvas from '../../LedCanvas.vue';
   import { useRoute, useRouter } from 'vue-router';
   import { v4 } from 'uuid';

   export default defineComponent({
      components: {
         LedCanvas
      },
      async setup() {

         const componentInstance = getCurrentInstance();
         const route = useRoute();
         const router = useRouter();

         const restClient = useRestClient();
         const animationClient = new AnimationRestClient(restClient);

         const animation: Partial<Animation> = route.params['animationId'] !== 'new' ? deepClone(await animationClient.latest(route.params['animationId'] as string, true)) : {
            id: v4(),
            script: useDefaultScript()
         };

         const { content } = useMonacoEditor('editor-ide-container', {
            javascriptLib: useJavascriptLib()
         }, componentInstance ?? undefined);

         content.value = animation.script ?? '';

         const scriptParseResult = computed(() => parseScript(content.value));

         const errorMessages = computed(() => {
            if (scriptParseResult.value.valid === false) { return scriptParseResult.value.errors.filter(e => e !== 'Script parsing failed'); }
            return [];
         });

         const frame = ref<Frame>([]);
         const iframeContext = ref<IFrameContext>();
         const isRunning = computed(() => !!iframeContext.value);
         let intervalTimeout: number | undefined | null;

         const executionError = ref<string>();
         const testScript = async () => {
            if (!content?.value?.trim()) { return; }

            executionError.value = undefined;

            try {
               iframeContext.value = await useIframeRunner(content.value);

               try {
                  await iframeContext.value.setNumLeds(90);
               } catch (e) {
                  throw new Error(`setNumLeds: ${e}`);
               }

               try {
                  frame.value = [...await iframeContext.value!.nextFrame()];
               } catch (e) {
                  throw new Error(`nextFrame: ${e}`);
               }

               intervalTimeout = setInterval(async () => {
                  try {
                     frame.value = [...await iframeContext.value!.nextFrame()];
                  } catch (e) {
                     executionError.value = `nextFrame: ${e}`;
                     stopScript();
                  }
               }, 50);

            } catch (e) {
               executionError.value = e.toString();
               stopScript();
            }

         };

         const stopScript = () => {
            if (!iframeContext.value) { return; }
            iframeContext.value.dispose();
            iframeContext.value = undefined;
            frame.value = [];
            if (intervalTimeout) { clearInterval(intervalTimeout); intervalTimeout = null; }
         };

         const animationPost: AnimationPost = reactive({
            id: animation.id!,
            script: content.value ?? '',
            name: animation.name ?? '',
            description: animation.description ?? ''
         });

         const contentStopHandle = watch(content, s => animationPost.script = s);

         const saveScript = async () => {
            await animationClient.saveDraft(animationPost);
            console.log('Saved animation');
            if (route.params['animationId'] === 'new') {
               router.replace({ params: { animationId: animationPost.id } });
            }
         };

         const onDrawError = (e: any) => {
            executionError.value = `draw: ${e}`;
            stopScript();
         };

         onUnmounted(() => {
            if (iframeContext.value) { iframeContext.value.dispose(); }
            if (intervalTimeout) { clearInterval(intervalTimeout); }
            contentStopHandle();
         }, componentInstance);

         return { testScript, errorMessages, saveScript, frame, animationPost, isRunning, stopScript, executionError, onDrawError };
      }
   });

</script>

<style lang="postcss" scoped>
   #canvas {
      height: 20px;
   }

   .col-right {
      width: 200px;
   }

   #editor-script-description {
      height: 200px;
   }
</style>
