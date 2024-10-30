<template>
    <div class="container-fluid p-3">
        <div class="row">
            <div class="col">
                <div class="list-group" v-if="postProcessors">
                    <router-link
                        :to="useRouteLocation(RouteName.PostProcessorEditor, { postProcessorId: a.id })"
                        class="list-group-item list-group-item-action"
                        v-for="a of postProcessors"
                        :key="a.id"
                    >
                        <div class="row">
                            <div class="col">
                                {{ a.name }}
                                <div v-if="a.description">
                                    {{ a.description }}
                                </div>
                            </div>
                            <div v-if="a.version === 'draft'" class="col-auto text-warning">
                                DRAFT
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>

            <teleport to="#portal-header">
                <router-link
                    class="btn btn-primary"
                    :to="useRouteLocation(RouteName.PostProcessorNew)"
                >
                    New PostProcessor
                </router-link>
            </teleport>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { usePostProcessorRestClient } from '../../services';
import { useRouteLocation, RouteName } from '$src/main.router';
import type { PostProcessorSummary } from '$core/rest/model/PostProcessor';

export default defineComponent({
    props: {},
    async setup() {
        const postProcessorClient = usePostProcessorRestClient();

        const postProcessors = ref<PostProcessorSummary[]>(await postProcessorClient.list());

        return { postProcessors, useRouteLocation, RouteName };
    },
});
</script>
