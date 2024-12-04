
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

                <div class="flex-grow-1">
                    <div v-if="animationConfig">
                        <h3 class="mt-3">
                            Config
                        </h3>
                        <config
                            type="animation"
                            :script="{ id: animationId, version: 'draft' }"
                            :config="animationConfig"
                            @update:settings="s => animationSettings = s"
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
                    <div v-if="animation.version === 'draft'" class="col-auto">
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

import { defineComponent, ref, computed, onUnmounted, getCurrentInstance } from 'vue';
import types from '$core/netled.types.d.ts?raw';
import config from './Config.vue';
import { useRouter } from 'vue-router';
import { RouteName, useRouteLocation } from '$src/main.router';
import { useMonacoEditor, assertTrue, restApi } from '$src/services';
import type { AnimationPost } from '$core/rest/model/Animation';
import type { Id } from '$core/rest/model/Id';
import { newId } from '$core/services/newId';
import { useCanvasRenderer } from '$src/services/animation/renderCanvas';
import { useAnimationWorkerAsync } from '$src/services/animation/animationWorker';
import { LedSegment } from '$core/LedSegment';
import { Icons } from '$src/components/global/Icon.vue';

export default defineComponent({
    components: { config },
    props: {
        animationId: { type: String as () => Id, required: true }
    },
    async setup(props) {

        const router = useRouter();

        const canvasContainer = ref<HTMLDivElement>();

        const numLeds = ref(100);

        const { content, issues, javascript, flushContent } = useMonacoEditor(
            'editor-ide-container',
            {
                typescriptLib: {
                    'global': types
                }
            }
        );

        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const canvasRenderer = useCanvasRenderer(canvasContainer);

        const ledSegment = computed(() => {
            const ls = new LedSegment(numLeds.value);
            ls.addSendCallback(canvasRenderer);
            return ls;
        });

        const { animationSettings, animationConfig, moduleIssues, dispose } = await useAnimationWorkerAsync(javascript, ledSegment);

        onUnmounted(() => dispose(), componentInstance);

        const animation = await restApi.animations.latest(props.animationId, true);
        content.value = animation.ts;

        const deleteScript = async () => {
            if (animation.version !== 'draft') {
                console.warn('Attempted to delete a non-draft animation');
                return;
            }
            await restApi.animations.deleteDraft(props.animationId);
            router.replace(useRouteLocation(RouteName.AnimationList));
        };

        const saveScript = async () => {

            flushContent();

            const animationPost: AnimationPost = {
                id: animation.version === 'draft' ? animation.id : newId(),
                description: animation.description,
                name: animation.name,
                ts: content.value
            };

            await restApi.animations.saveDraft(animationPost);

            if (animationPost.id !== animation.id) {
                router.replace(useRouteLocation(RouteName.AnimationEditor, { animationId: animationPost.id }));
            }
        };

        return { issues: computed(() => [...issues.value, ...moduleIssues.value]), canvasContainer, animationConfig, animationSettings, numLeds, deleteScript, animation, saveScript, Icons };
    },
});

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
