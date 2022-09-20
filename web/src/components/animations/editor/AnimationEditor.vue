
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
                    <config :animation="{ id: animationId, version: 'draft' }" :config="config" @update:settings="s => settings = s"></config>
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
                            <i class="fal fa-fw fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, ref, watch, computed } from 'vue';
import { LedArray } from '@/components/LedArray';
import LedCanvas from '@/components/LedCanvas.vue';
import types from '../../../types.d.ts?raw';
import AnimationWorker from './animationWorker?worker';
import config from './Config.vue';
import { deepClone, CodeIssue, Id, AnimationPost, newId } from '@krakerxyz/netled-core';
import { useAnimationRestClient, useMonacoEditor } from '@/services';
import { useRouter } from 'vue-router';
import { RouteName, useRouteLocation, useRouteLocation as useRouteMain } from '@/main.router';

export default defineComponent({
    components: { LedCanvas, config },
    props: {
        animationId: { type: String as () => Id, required: true }
    },
    async setup(props) {

        const router = useRouter();

        const ledCanvas = ref<any>();

        const arrayOffset = 0;

        const numLeds = ref(100);

        const buffers = computed(() => {
            const sab = new SharedArrayBuffer(numLeds.value * 4);
            const fullArray = new LedArray(sab, numLeds.value, arrayOffset, () => Promise.resolve());
            return {
                sab, fullArray
            };
        });

        const { content, issues, javascript, flushContent } = useMonacoEditor(
            'editor-ide-container',
            {
                typescriptLib: {
                    'global': types
                }
            }
        );

        const moduleIssues = ref<CodeIssue[]>([]);

        let worker: Worker | null = null;

        const config = ref<netled.common.IConfig>();

        watch([javascript, buffers], async x => {
            const [js, buffers] = x;
            const { fullArray, sab } = buffers;
            if (!js) { return; }
            if (issues.value.length) {
                return;
            }
            try {

                worker?.terminate();
                worker = null;

                worker = new AnimationWorker();

                worker.addEventListener('message', (e: MessageEvent<any>) => {
                    const data = e.data;
                    switch(data.name) {
                        case 'moduleError': {
                            moduleIssues.value = data.errors;
                            break;
                        }
                        case 'render': {
                            ledCanvas.value?.render(fullArray);
                            worker?.postMessage({ name: 'rendered' });
                            break;
                        }
                        case 'config': {
                            config.value = data.config;
                            break;
                        }
                    }
                });

                worker.postMessage({ name: 'init', sab, js, numLeds: numLeds.value, arrayOffset });

            } catch (e: any) {
                moduleIssues.value = [{ severity: 'error', line: 0, col: 0, message: `Error creating instance of script: ${e.message ?? e.toString()}` }];
                console.error(e);
            }
        }, { immediate: true });

        const settings = ref<netled.common.ISettings>();
        watch(settings, settings => {
            try {
                console.log('Received settings');
                if (!worker) { return; }
                settings = deepClone(settings);
                worker.postMessage({ name: 'update-settings', settings });
            } catch (e: any) {
                console.error(`Error sending settings to worker: ${e.message ?? e.toString()}`, e);
            }
        }, { deep: true });

        const animationApi = useAnimationRestClient();
        const animation = await animationApi.latest(props.animationId, true);

        content.value = animation.ts;

        const deleteScript = async () => {
            if (animation.version !== 'draft') {
                console.warn('Attempted to delete a non-draft animation');
                return;
            }
            await animationApi.deleteDraft(props.animationId);
            router.replace(useRouteMain(RouteName.AnimationList));
        };

        const saveScript = async () => {

            flushContent();

            const animationPost: AnimationPost = {
                id: animation.version === 'draft' ? animation.id : newId(),
                description: animation.description,
                name: animation.name,
                ts: content.value
            };

            await animationApi.saveDraft(animationPost);

            if (animationPost.id !== animation.id) {
                router.replace(useRouteLocation(RouteName.AnimationEditor, { animationId: animationPost.id }));
            }
        };

        return { issues: computed(() => [...issues.value, ...moduleIssues.value]), ledCanvas, config, settings, numLeds, deleteScript, animation, saveScript };
    },
});

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