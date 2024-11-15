<template>
    <div class="container-fluid p-3">
        <div class="row">
            <div class="col">
                <div class="list-group" v-if="strands">
                    <router-link
                        :to="useRouteLocation(RouteName.StrandEditor, { strandId: strand.id })"
                        class="list-group-item list-group-item-action"
                        v-for="strand of strands"
                        :key="strand.id"
                    >
                        <div class="row">
                            <div class="col">
                                {{ strand.name }}
                                <div v-if="strand.description">
                                    {{ strand.description }}
                                </div>
                                <div class="text-muted small">
                                    {{ strand.numLeds }} LEDs
                                </div>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>

            <teleport to="#portal-header">
                <router-link
                    class="btn btn-primary"
                    :to="useRouteLocation(RouteName.StrandNew)"
                >
                    New Strand
                </router-link>
            </teleport>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStrandRestClient } from '../../services';
import { useRouteLocation, RouteName } from '$src/main.router';
import type { Strand } from '$core/rest/model/Strand';

export default defineComponent({
    props: {},
    async setup() {
        const strandClient = useStrandRestClient();
        const strands = ref<Strand[]>(await strandClient.list());

        return { strands, useRouteLocation, RouteName };
    },
});
</script>