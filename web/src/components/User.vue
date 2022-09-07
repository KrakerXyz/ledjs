
<template>
    <div>
        <!-- <button
            type="button"
            v-if="status === 'signedOut'"
            class="btn btn-link nav-link"
            @click="signIn()"
        >
            Sign In/Up
        </button> -->

        <div id="google-login-button"></div>

        <!-- I tried putting the v-if on the spinner but we get a vue error. It should work. Seems like a legitimate bug with vue at the time (3/19/2021). Try again later -->
        <!-- <div
            class="nav-link"
            v-if="status === 'initializing'"
        >
            <v-spinner class="loading text-white"></v-spinner>
        </div>

        <div
            class="user-menu position-relative"
            v-if="avatarUrl && status==='signedIn'"
        >
            <img
                :src="avatarUrl"
                alt="Signed In"
            >

            <ul class="d-none position-absolute list-group">
                <button
                    type="button"
                    class="list-group-item list-group-item-action"
                    @click="signOut()"
                >
                    Sign out
                </button>
            </ul>
        </div> -->
    </div>
</template>

<script lang="ts">

import { defineComponent, onMounted } from 'vue';
//import { useRouter } from 'vue-router';
import { assertTrue } from '../services';
import { initGoogleLoginButton } from '@/services/loginGoogleIdentity';

export default defineComponent({
    setup() {
        //const router = useRouter();
        //const login = useLoginService(() => router);

        onMounted(() => {
            const div = document.getElementById('google-login-button') as HTMLDivElement;
            assertTrue(div);
            initGoogleLoginButton(div);
        });

        //return { ...login };
        return {};
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