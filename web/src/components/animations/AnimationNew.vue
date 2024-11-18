
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

import { defineComponent, reactive } from 'vue';
import { useRouter } from 'vue-router';
import example from './editor/Script.ts?raw';
import { useRouteLocation, RouteName } from '$src/main.router';
import type { AnimationPost } from '$core/rest/model/Animation';
import { newId } from '$core/services/newId';
import { restApi } from '$src/services';

export default defineComponent({
    props: {
    },
    setup() {
        const router = useRouter();
        const animationPost = reactive<AnimationPost>({
            id: newId(),
            name: '',
            ts: example,
            description: null
        });

        const submit = async () => {
            if (!animationPost.name) { return; }
            await restApi.animations.saveDraft(animationPost);
            router.replace(useRouteLocation(RouteName.AnimationEditor, { animationId: animationPost.id }));
        };

        return { animationPost, submit };
    }
});

</script>
