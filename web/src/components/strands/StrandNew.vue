<template>
    <form class="p-3" @submit.prevent="submit()">
        <div class="row">
            <div class="col-md-6 col-lg-3">
                <div class="form-floating">
                    <input
                        id="strand-name"
                        class="form-control"
                        placeholder="*"
                        v-model="strandPost.name"
                    >
                    <label for="strand-name">Strand Name</label>
                </div>
            </div>
            <div class="col-md-6 col-lg-3">
                <div class="form-floating">
                    <input
                        id="strand-leds"
                        type="number"
                        min="1"
                        class="form-control"
                        placeholder="*"
                        v-model="strandPost.numLeds"
                    >
                    <label for="strand-leds">Number of LEDs</label>
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
import { useRouteLocation, RouteName } from '$src/main.router';
import type { StrandPost } from '$core/rest/model/Strand';
import { newId } from '$core/services/newId';
import { restApi } from '$src/services';

export default defineComponent({
    setup() {
        const router = useRouter();

        const strandPost = reactive<StrandPost>({
            id: newId(),
            name: '',
            description: '',
            numLeds: 100,
            segments: []
        });

        const submit = async () => {
            if (!strandPost.name) { return; }
            await restApi.strands.save(strandPost);
            router.replace(useRouteLocation(RouteName.StrandEditor, { strandId: strandPost.id }));
        };

        return { strandPost, submit };
    }
});
</script>
