<template>
    <div id="app-wrapper" class="vh-100 bg-light d-flex flex-column">
        <div class="navbar navbar-expand navbar-dark bg-dark sticky-top">
            <div class="container">
                <ul class="navbar-nav">
                    <li v-if="!isLoggedIn" class="nav-item">
                        <router-link class="nav-link" :to="useRouteLocation(RouteName.Home)">
                            Home
                        </router-link>
                    </li>
                    <template v-if="isLoggedIn">
                        <li class="nav-item">
                            <router-link
                                class="nav-link"
                                :to="useRouteLocation(RouteName.AnimationList)"
                            >
                                Animations
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link
                                class="nav-link"
                                :to="useRouteLocation(RouteName.PostProcessorList)"
                            >
                                Post-Processors
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link
                                class="nav-link"
                                :to="useRouteLocation(RouteName.StrandEditor, { strandId: 'a4499840-13b9-4dc9-b27a-2bc92a86a1c7' })"
                            >
                                Strands
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link
                                class="nav-link"
                                :to="useRouteLocation(RouteName.DeviceList)"
                            >
                                Devices
                            </router-link>
                        </li>
                    </template>
                </ul>
                <ul class="navbar-nav">
                    <li id="portal-header" class="nav-item me-3"></li>
                    <li class="nav-item">
                        <user></user>
                    </li>
                </ul>
            </div>
        </div>

        <div class="flex-grow-1 position-relative overflow-hidden">
            <Suspense>
                <template #default>
                    <router-view></router-view>
                </template>
                <template #fallback>
                    <span>Loading...</span>
                </template>
            </Suspense>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
//import { useRouter } from 'vue-router';
//import { useLoginService } from '../services';
import User from './User.vue';
import { useAuthService } from '$src/services/authService';
import { RouteName, useRouteLocation } from '$src/main.router';

export default defineComponent({
    components: {
        User,
    },
    setup() {
        const authService = useAuthService();
        const isLoggedIn = computed(() => authService.status.value === 'signedIn');

        return { isLoggedIn, useRouteLocation, RouteName };
    },
});
</script>

<style lang="postcss">
.clickable {
    cursor: pointer;
}

.mt-n3 {
    margin-top: -1rem;
}
</style>
