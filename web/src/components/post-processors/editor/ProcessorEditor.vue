
<template>
    <div class="d-flex flex-column h-100">
        <LedCanvas class="led-canvas" ref="ledCanvas"></LedCanvas>
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
                                {{i.message}} [{{ i.line }}, {{ i.col }}]
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

                    <div v-if="config" class="flex-grow-1">
                        <h3 class="mt-3">
                            Config
                        </h3>
                    <!-- <config :animation="{ id: animationId, version: 'draft' }" :config="config" @update:settings="s => settings = s"></config> -->
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
                            <i class="fal fa-fw fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { useMonacoEditor, usePostProcessorRestClient } from '@/services';
import { ScriptVersion, Id, newId, PostProcessorPost } from '@krakerxyz/netled-core';
import { defineComponent, ref, watch } from 'vue';
import types from '../../../types.d.ts?raw';
import LedCanvas from '@/components/LedCanvas.vue';
import { RouteName, useRouteLocation } from '@/main.router';
import { useRouter } from 'vue-router';

export default defineComponent({
    components: {
        LedCanvas
    },
    props: {
        postProcessorId: { type: String as () => Id, required: true }
    },
    async setup(props) {

        const postProcessorApi = usePostProcessorRestClient();
        const router = useRouter();

        const ledCanvas = ref<any>();

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

        const config = ref<netled.common.IConfig>();

        watch(javascript, js => {
            console.log(js);
        });

        const postProcessor = await postProcessorApi.latest(props.postProcessorId, true);
        content.value = postProcessor.ts;

        const saveScript = async () => {
            flushContent();
            const postProcessorPost: PostProcessorPost = {
                id: postProcessor.version === 'draft' ? postProcessor.id : newId(),
                description: postProcessor.description,
                name: postProcessor.name,
                ts: content.value
            };

            await postProcessorApi.saveDraft(postProcessorPost);

            if (postProcessorPost.id !== postProcessor.id) {
                router.replace(useRouteLocation(RouteName.PostProcessorEditor, { postProcessorId: postProcessorPost.id }));
            }
        };

        const deleteScript = async () => {
            if (postProcessor.version !== 'draft') {
                console.warn('Attempted to delete a non-draft postProcessor');
                return;
            }
            await postProcessorApi.deleteDraft(props.postProcessorId);
            router.replace(useRouteLocation(RouteName.PostProcessorList));
        };
        
        return { numLeds, ledCanvas, config, processor, saveScript, deleteScript, issues };
    }
});

interface IPostProcessor {
    id: Id,
    version: ScriptVersion
}

</script>

<style lang="postcss" scoped>
    .ide-errors {
        min-height: 100px;
        max-height: 50%;
    }

    .led-canvas {
        height: 20px;
    }
</style>
