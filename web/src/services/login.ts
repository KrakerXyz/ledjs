import { GoogleToken, AuthRestClient } from '@krakerxyz/netled-core';
import { ref } from 'vue';
import { Router } from 'vue-router';
import { useRestClient } from './restClient';

let user: gapi.auth2.GoogleUser | null = null;
const avatarUrl = ref<string | null>(null);
const status = ref<'signedOut' | 'initializing' | 'signedIn'>('initializing');

function init(): Promise<void> {
    return new Promise<void>((r) => {
        const client_id = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
        status.value = 'initializing';
        gapi.load('auth2', () => {
            gapi.auth2
                .init({
                    client_id,
                    fetch_basic_profile: true,
                })
                .then(
                    (auth2) => {
                        if (auth2.isSignedIn.get()) {
                            const googleUser = auth2.currentUser.get();
                            verifyToken(googleUser, auth2)
                                .then((u) => (user = u))
                                .finally(() => r());
                        } else {
                            status.value = 'signedOut';
                            r();
                        }
                    },
                    (e) => {
                        console.debug('Failed to initialize gapi', e);
                        status.value = 'signedOut';
                        r();
                    }
                );
        });
    });
}

async function verifyToken(googleUser: gapi.auth2.GoogleUser, auth2: gapi.auth2.GoogleAuthBase): Promise<gapi.auth2.GoogleUser> {
    const authResponse = googleUser.getAuthResponse();

    const googleToken: GoogleToken = {
        idToken: authResponse.id_token,
    };

    try {
        const restClient = useRestClient();
        const authApi = new AuthRestClient(restClient);

        await authApi.validateGoogleToken(googleToken);

        avatarUrl.value = googleUser.getBasicProfile().getImageUrl();
        status.value = 'signedIn';

        return googleUser;
    } catch {
        auth2.signOut();
        throw new Error('Error validating token');
    }
}

let intiProm: Promise<void> = init();

async function signIn(): Promise<void> {
    await intiProm;
    if (user) {
        return;
    }
    const auth2 = gapi.auth2.getAuthInstance();

    status.value = 'initializing';
    return new Promise<void>((r) => {
        auth2.signIn().then(
            (googleUser) => {
                verifyToken(googleUser, auth2)
                    .then((u) => (user = u))
                    .finally(() => r());
            },
            () => {
                console.debug('Sign-in canceled');
                status.value = 'signedOut';
                r();
            }
        );
    });
}

async function signOut() {
    await intiProm;
    if (!user) {
        return;
    }
    status.value = 'initializing';
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        user = null;
        avatarUrl.value = null;
        status.value = 'signedOut';
        intiProm = init();
    });
}

export function useLoginService(routerProvider: () => Router) {
    const signOutAndRedirect = () => {
        const router = routerProvider();
        signOut();
        router.replace({ name: 'home' });
    };

    return {
        signIn,
        signOut: signOutAndRedirect,
        avatarUrl,
        status,
    };
}
