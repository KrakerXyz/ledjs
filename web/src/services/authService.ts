import { ref } from 'vue';
import { AuthRestClient, GoogleJwt, User } from '@krakerxyz/netled-core';
import { useRestClient } from '.';
import Cookies from 'js-cookie';
import { computed } from '@vue/reactivity';
import { loginRedirect, logoutRedirect } from '@/main.router';

let initResolver: (() => void) | null = null;
const initPromise = new Promise<void>(r => initResolver = r);
const status = ref<'signedOut' | 'initializing' | 'signedIn'>('initializing');
const user = ref<User>();

const GoogleJwtCookieName = 'g-jwt';
const NetLedJwtCookieName = 'jwt';

export async function initGoogleLoginButton(container: HTMLDivElement) {
    status.value = 'initializing';

    let cookieJwt = Cookies.get(GoogleJwtCookieName) ?? null;
    if (cookieJwt) {
        try {
            console.debug('Loading user from existing g-jwt');
            user.value = await verifyToken(cookieJwt);
            status.value = 'signedIn';
            console.debug('Loaded user from existing g-jwt', user);
            loginRedirect();
        } catch (e) {
            console.warn('Could not validate existing g-jwt', e);
            Cookies.remove(GoogleJwtCookieName);
            Cookies.remove(NetLedJwtCookieName);
            cookieJwt = null;
        }
    }

    if (!cookieJwt) {
        window.addEventListener('load', () => {
            console.debug('Initializing GIS');

            if (!import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
                throw new Error('Missing VITE_GOOGLE_CLIENT_ID environment variable');
            }

            google.accounts.id.initialize({
                client_id: import.meta.env?.VITE_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: true
            });

            google.accounts.id.renderButton(
                container,
                { theme: 'outline', size: 'large' } as any
            );

            google.accounts.id.prompt(notification => {
                console.debug('Got notification', notification);
            });

            status.value = 'signedOut';

        }, { once: true });
    }


    initResolver!();
}

async function handleCredentialResponse(response: google.accounts.id.CredentialResponse): Promise<void> {
    status.value = 'initializing';
    console.debug('Got GIS JWT. Validating');
    try {
        user.value = await verifyToken(response.credential);
        Cookies.set(GoogleJwtCookieName, response.credential, {
            secure: window.location.protocol === 'https',
            sameSite: 'strict',
            expires: 365
        });
        status.value = 'signedIn';
        console.debug('Got NetLed user', user);
        loginRedirect();
    } catch (e) {
        console.error('Error verifying token', e);
        Cookies.remove(GoogleJwtCookieName);
        Cookies.remove(NetLedJwtCookieName);
        google.accounts.id.disableAutoSelect();
        status.value = 'signedOut';
    }
}

async function verifyToken(jwt: string): Promise<User> {
    const googleJwt: GoogleJwt = {
        jwt,
    };

    try {
        const restClient = useRestClient();
        const authApi = new AuthRestClient(restClient);

        const user = await authApi.validateGoogleJwt(googleJwt);
        return user;
    } catch {
        throw new Error('Error validating token');
    }
}

const authService = Object.freeze({
    status: computed(() => status.value),
    user: computed(() => user.value),
    initialized: initPromise,
    logout: () => {
        google.accounts.id.disableAutoSelect();
        Cookies.remove(GoogleJwtCookieName);
        Cookies.remove(NetLedJwtCookieName);
        status.value = 'signedOut';
        logoutRedirect();
    }
});

export function useAuthService() {
    return authService;
}