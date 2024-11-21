
<template>
    <div class="d-flex flex-column h-100">
        <div ref="canvasContainer" class="canvas-container overflow-hidden"></div>
        <div class="flex-grow-1 row g-0">
            <div class="col">
                <div class="h-100 d-flex flex-column">
                    <div class="flex-grow-1 position-relative">
                        <div id="editor-ide-container" class="h-100 w-100 position-absolute" />
                    </div>

                    <div v-if="issues.length" class="ide-errors bg-dark">
                        <ul class="list-group font-monospace text-white">
                            <li v-for="(i, $index) of issues" :key="$index" class="p-1">
                                <span v-if="i.severity === 'warning'" class="text-warning"><i class="fa-solid fa-lg fa-fw fa-exclamation-triangle"></i></span>
                                <span v-else class="text-danger"><i class="fa-solid fa-lg fa-fw fa-bomb"></i></span>
                                {{ i.message }} [{{ i.line }}, {{ i.col }}]
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="col-lg-3 p-2 d-flex flex-column">
                <div class="flex-grow-1">
                    <h3>Setup</h3>
                    <div class="form-floating">
                        <input
                            id="d-leds"
                            class="form-control"
                            placeholder="*"
                            v-model.lazy.number="numLeds"
                        >
                        <label for="d-leds"># LEDs</label>
                    </div>

                    <div class="form-floating">
                        <select
                            id="source-animation-id"
                            class="form-select"
                            placeholder="*"
                            v-model="selectedAnimationId"
                        >
                            <option v-for="a of animations" :key="a.id" :value="a.id">
                                {{ a.name }}
                            </option>
                        </select>
                        <label for="source-animation-id">Source Animation</label>
                    </div>

                    <div v-if="animationConfig && selectedAnimation" class="flex-grow-1">
                        <h3 class="mt-3">
                            Config
                        </h3>
                        <config
                            :animation="{ id: selectedAnimation.id, version: selectedAnimation.version }"
                            :config="animationConfig"
                            @update:settings="s => animationSettings = s"
                            :readonly="true"
                        ></config>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <button
                            @click="saveScript()"
                            :disabled="!!issues.length"
                            type="button"
                            class="btn btn-primary w-100"
                        >
                            Save
                        </button>
                    </div>
                    <div v-if="processor.version === 'draft'" class="col-auto">
                        <button type="button" class="btn btn-danger w-100" @click.once="deleteScript()">
                            <v-icon :icon="Icons.Trashcan"></v-icon>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { computed, defineComponent, getCurrentInstance, onUnmounted, ref, watch } from 'vue';
import types from '../../../../../core/src/netled.types.d.ts?raw';
import { useRouter } from 'vue-router';
import config from '../../animations/editor/Config.vue';
import { useRouteLocation, RouteName } from '$src/main.router';
import type { Id } from '$core/rest/model/Id';
import type { PostProcessorPost } from '$core/rest/model/PostProcessor';
import type { ScriptVersion } from '$core/rest/model/ScriptVersion';
import { newId } from '$core/services/newId';
import { useCanvasRenderer } from '$src/services/animation/renderCanvas';
import { useAnimationWorkerAsync } from '$src/services/animation/animationWorker';
import { usePostProcessorWorkerAsync } from '$src/services/animation/postProcessorWorker';
import { LedSegment } from '$core/LedSegment';
import { Icons } from '$src/components/global/Icon.vue';
import { assertTrue, useMonacoEditor, restApi } from '$src/services';

export default defineComponent({
    components: { config },
    props: {
        postProcessorId: { type: String as () => Id, required: true }
    },
    async setup(props) {

        const router = useRouter();
        
        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const numLeds = ref(100);

        const processor: IPostProcessor = {
            id: props.postProcessorId,
            version: 'draft'
        };

        const { content, issues, javascript, flushContent } = useMonacoEditor(
            'editor-ide-container',
            {
                typescriptLib: {
                    'global': types
                }
            }
        );
        
        const selectedAnimationId = ref<Id>();

        const animationJavascript = ref<string>();

        watch(selectedAnimationId, id => {
            animationJavascript.value = undefined;
            if (!id) { return; }
            restApi.animations.latest(id, true).then(a => {
                if (selectedAnimationId.value !== id) { return; }
                animationJavascript.value = a.js;
            });
        });

        const [postProcessor, animations] = await Promise.all([
            restApi.postProcessors.latest(props.postProcessorId, true),
            restApi.animations.list()
        ]);

        selectedAnimationId.value = animations[0]?.id;
        content.value = postProcessor.ts;

        const saveScript = async () => {
            flushContent();
            const postProcessorPost: PostProcessorPost = {
                id: postProcessor.version === 'draft' ? postProcessor.id : newId(),
                description: postProcessor.description,
                name: postProcessor.name,
                ts: content.value
            };

            await restApi.postProcessors.saveDraft(postProcessorPost);

            if (postProcessorPost.id !== postProcessor.id) {
                router.replace(useRouteLocation(RouteName.PostProcessorEditor, { postProcessorId: postProcessorPost.id }));
            }
        };

        const deleteScript = async () => {
            if (postProcessor.version !== 'draft') {
                console.warn('Attempted to delete a non-draft postProcessor');
                return;
            }
            await restApi.postProcessors.deleteDraft(props.postProcessorId);
            router.replace(useRouteLocation(RouteName.PostProcessorList));
        };

        const selectedAnimation = computed(() => {
            if (!selectedAnimationId.value) { return undefined; }
            const a = animations.find(x => x.id === selectedAnimationId.value);
            return a;
        });

        const sab = computed(() => new SharedArrayBuffer(numLeds.value * 4));

        const canvasContainer = ref<HTMLDivElement>();
        const canvasRenderer = useCanvasRenderer(canvasContainer);

        const ledArrRend = computed(() => {
            const ls = new LedSegment(sab.value, numLeds.value, 0);
            ls.addSendCallback(canvasRenderer);
            return ls;
        });

        const ledSegmentPost = computed(() => {
            const ls = new LedSegment(sab.value, numLeds.value, 0);
            ls.addSendCallback(ledArrRend.value.send);
            return ls;
        });

        const postContext = await usePostProcessorWorkerAsync(javascript, ledSegmentPost);

        const ledSegmentAnim = computed(() => {
            const ls = new LedSegment(sab.value, numLeds.value, 0);
            ls.addSendCallback(postContext.ledSegmentInput);
            return ls;
        });
        const animationContext = await useAnimationWorkerAsync(animationJavascript, ledSegmentAnim);

        onUnmounted(() => {
            animationContext.dispose();
            postContext.dispose();
        }, componentInstance);

        return { numLeds, canvasContainer, animationConfig: animationContext.animationConfig, processor, saveScript, deleteScript, issues, animations, selectedAnimationId, selectedAnimation, animationSettings: animationContext.animationSettings, Icons };
    }
});

interface IPostProcessor {
    id: Id,
    version: ScriptVersion,
}

</script>

<style lang="postcss" scoped>
    .ide-errors {
        min-height: 100px;
        max-height: 50%;
    }

    .canvas-container :deep(canvas) {
        height: 20px;
    }
</style>
