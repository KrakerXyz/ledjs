<template>
    <div class="container-fluid p-3">
        <div class="row">
            <div class="col">
                <div class="list-group" v-if="animations">
                    <router-link
                        :to="useRouteLocation(RouteName.AnimationEditor, { animationId: a.id })"
                        class="list-group-item list-group-item-action"
                        v-for="a of animations"
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
                    :to="useRouteLocation(RouteName.AnimationNew)"
                >
                    New Animation
                </router-link>
            </teleport>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAnimationRestClient } from '../../services';
import type { AnimationSummary } from '$core/index';
import { useRouteLocation, RouteName } from '$src/main.router';

export default defineComponent({
    props: {},
    async setup() {
        const animationClient = useAnimationRestClient();

        const animations = ref<AnimationSummary[]>(await animationClient.list());

        return { animations, useRouteLocation, RouteName };
    },
});
</script>
