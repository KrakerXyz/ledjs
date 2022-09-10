
<template>
    <form class="p-3" @submit.prevent="submit()">
        <div class="row">
            <div class="col-md-6 col-lg-3">
                <div class="form-floating">
                    <input
                        id="animation-name"
                        class="form-control"
                        placeholder="*"
                        v-model="animationPost.name"
                    >
                    <label for="animation-name">Animation Name</label>
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

import { RouteName, useRoute } from '@/main.router';
import { useRestClient } from '@/services';
import { AnimationPost, AnimationRestClient, newId } from '@krakerxyz/netled-core';
import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import example from './editor/Script.ts?raw';

export default defineComponent({
    props: {
    },
    setup() {
        const router = useRouter();
        const restClient = useRestClient();
        const animationsApi = new AnimationRestClient(restClient);

        const animationPost = reactive<AnimationPost>({
            id: newId(),
            name: '',
            ts: example,
            description: null
        });

        const submit = async () => {
            if (!animationPost.name) { return; }
            await animationsApi.saveDraft(animationPost);
            router.replace(useRoute(RouteName.AnimationEditor, { animationId: animationPost.id }));
        };

        return { animationPost, submit };
    }
});

</script>
