
<template>
    <div class="h-100 d-flex align-content-center">
        <div v-show="authService.status.value === 'signedOut'">
            <div id="google-login-button"></div>
        </div>

        <!-- I tried putting the v-if on the spinner but we get a vue error. It should work. Seems like a legitimate bug with vue at the time (3/19/2021). Try again later -->
        <div
            class="nav-link"
            v-if="authService.status.value === 'initializing'"
        >
            <v-spinner class="loading text-white"></v-spinner>
        </div>

        <div
            class="user-menu position-relative"
            v-if="authService.user.value?.avatarUrl && authService.status.value==='signedIn'"
        >
            <img
                :src="authService.user.value.avatarUrl"
                alt="Signed In"
                crossorigin="anonymous"
            >

            <ul class="d-none position-absolute list-group">
                <button
                    type="button"
                    class="list-group-item list-group-item-action"
                    @click="authService.logout()"
                >
                    Sign out
                </button>
            </ul>
        </div> -->
    </div>
</template>

<script lang="ts">

import { defineComponent, onMounted } from 'vue';
import { assertTrue } from '../services';
import { initGoogleLoginButton, useAuthService } from '@/services/authService';

export default defineComponent({
    setup() {
        const authService = useAuthService();

        onMounted(() => {
            const div = document.getElementById('google-login-button') as HTMLDivElement;
            assertTrue(div);
            initGoogleLoginButton(div);
        });

        return { authService };
    }
});

</script>

<style lang="postcss" scoped>
   .user-menu {
      img {
         height: 35px;
         width: auto;
         border-radius: 10%;
      }

      &:hover ul {
         display: block !important;
         right: 0;
         white-space: nowrap;
      }
   }
</style>