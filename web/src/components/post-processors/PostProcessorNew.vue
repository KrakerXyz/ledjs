
<template>
    <form class="p-3" @submit.prevent="submit()">
        <div class="row">
            <div class="col-md-6 col-lg-3">
                <div class="form-floating">
                    <input
                        id="postProcessor-name"
                        class="form-control"
                        placeholder="*"
                        v-model="postProcessorPost.name"
                    >
                    <label for="postProcessor-name">PostProcessor Name</label>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-auto">
                <button type="submit" class="btn btn-primary w-100">
                    Create
                </button>
            </div>
        </div>
    </form>
</template>

<script lang="ts">

import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import example from './editor/Script.ts?raw';
import { useRouteLocation, RouteName } from '$src/main.router';
import { usePostProcessorRestClient } from '$src/services';
import type { PostProcessorPost } from '$core/rest/model/PostProcessor';
import { newId } from '$core/services/newId';

export default defineComponent({
    props: {
    },
    setup() {
        const router = useRouter();
        const postProcessorsApi = usePostProcessorRestClient();

        const postProcessorPost = reactive<PostProcessorPost>({
            id: newId(),
            name: '',
            ts: example,
            description: null
        });

        const submit = async () => {
            if (!postProcessorPost.name) { return; }
            await postProcessorsApi.saveDraft(postProcessorPost);
            router.replace(useRouteLocation(RouteName.PostProcessorEditor, { postProcessorId: postProcessorPost.id }));
        };

        return { postProcessorPost, submit };
    }
});

</script>
