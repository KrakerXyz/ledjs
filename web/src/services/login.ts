
import { GoogleToken, AuthClient } from 'netled';
import { ref } from 'vue';
import { useRestClient } from './restClient';

let user: gapi.auth2.GoogleUser | null = null;
const avatarUrl = ref<string | null>(null);
const loginStatus = ref<'signedOut' | 'initializing' | 'signedIn'>('initializing');

function init(): Promise<void> {

    return new Promise<void>(r => {

        const client_id = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
        loginStatus.value = 'initializing';
        gapi.load('auth2', () => {
            gapi.auth2.init({
                client_id,
                cookie_policy: 'single_host_origin',
                fetch_basic_profile: true
            }).then(
                auth2 => {

                    if (auth2.isSignedIn.get()) {
                        const googleUser = auth2.currentUser.get();
                        verifyToken(googleUser, auth2)
                            .then(u => user = u)
                            .finally(() => r());
                    } else {
                        loginStatus.value = 'signedOut';
                        r();
                    }

                },
                e => {
                    console.debug('Failed to initialize gapi', e);
                    loginStatus.value = 'signedOut';
                    r();
                }
            );

        });

    });
}

async function verifyToken(googleUser: gapi.auth2.GoogleUser, auth2: gapi.auth2.GoogleAuth): Promise<gapi.auth2.GoogleUser> {

    const authResponse = googleUser.getAuthResponse();

    const googleToken: GoogleToken = {
        idToken: authResponse.id_token
    };

    try {

        const restClient = useRestClient();
        const authApi = new AuthClient(restClient);

        await authApi.validateGoogleToken(googleToken);

        avatarUrl.value = googleUser.getBasicProfile().getImageUrl();
        loginStatus.value = 'signedIn';

        return googleUser;

    } catch {
        auth2.signOut();
        throw new Error('Error validating token');
    }
}

let intiProm: Promise<void> = init();

async function signIn(): Promise<void> {
    await intiProm;
    if (user) { return; }
    const auth2 = gapi.auth2.getAuthInstance();

    loginStatus.value = 'initializing';
    return new Promise<void>(r => {
        auth2.signIn().then(
            googleUser => {
                verifyToken(googleUser, auth2)
                    .then(u => user = u)
                    .finally(() => r());
            },
            () => {
                console.debug('Sign-in canceled');
                loginStatus.value = 'signedOut';
                r();
            }
        );
    });
}

async function signOut() {
    await intiProm;
    if (!user) { return; }
    loginStatus.value = 'initializing';
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        user = null;
        avatarUrl.value = null;
        loginStatus.value = 'signedOut';
        intiProm = init();
    });
}

export function useLoginService() {
    return {
        signIn,
        signOut,
        avatarUrl,
        loginStatus
    };
}