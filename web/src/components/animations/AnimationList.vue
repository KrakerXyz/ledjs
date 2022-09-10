<template>
    <div class="container h-100 shadow bg-white p-3">
        <div class="row">
            <div class="col">
                <div class="list-group" v-if="animations">
                    <div
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
                            <div class="col-auto d-flex align-items-center">
                                <router-link
                                    :to="{
                                        name: 'animation-editor',
                                        params: { animationId: a.id },
                                    }"
                                >
                                    <i class="fal fa-edit"></i>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

 
                <teleport to="#portal-header">
                    <router-link
                        class="btn btn-primary"
                        :to="useRoute(RouteName.AnimationNew)"
                    >
                        New Animation
                    </router-link>
                </teleport>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { AnimationRestClient, AnimationSummary } from '@krakerxyz/netled-core';
import { defineComponent, ref } from 'vue';
import { useRestClient } from '../../services';
import { RouteName, useRoute } from '@/main.router';

export default defineComponent({
    props: {},
    async setup() {
        const restClient = useRestClient();
        const animationClient = new AnimationRestClient(restClient);

        const animations = ref<AnimationSummary[]>(await animationClient.list());

        return { animations, useRoute, RouteName };
    },
});
</script>
