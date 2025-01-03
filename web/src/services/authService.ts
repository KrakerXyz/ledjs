import { ref } from 'vue';
import Cookies from 'js-cookie';
import { computed } from 'vue';
import { loginRedirect, logoutRedirect } from '$src/main.router';
import { type User, type GoogleJwt, AuthResult, UserServices } from '$core/rest/AuthRestClient';
import { restApi } from './restClient';

let initResolver: (() => void) | null = null;
const initPromise = new Promise<void>(r => initResolver = r);
const status = ref<'signedOut' | 'initializing' | 'signedIn'>('initializing');
const user = ref<User>();
const userServices = ref<UserServices>();

const GoogleJwtCookieName = 'g-jwt';
const NetLedJwtCookieName = 'jwt';

export async function initGoogleLoginButton(container: HTMLDivElement) {
    status.value = 'initializing';

    // Doing it this way because when I just register the load even after the await  verifyToken it never gets called
    const windowLoadProm = new Promise<void>(r => window.addEventListener('load', () => r(), { once: true }));

    let cookieJwt = Cookies.get(GoogleJwtCookieName) ?? null;
    if (cookieJwt) {
        try {
            console.debug('Loading user from existing g-jwt');
            const result = await verifyToken(cookieJwt);
            user.value = result.user;
            userServices.value = result.services;
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
        console.debug('Waiting for window load for GIS init');
        await windowLoadProm;
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

    }


    initResolver!();
}

async function handleCredentialResponse(response: google.accounts.id.CredentialResponse): Promise<void> {
    status.value = 'initializing';
    console.debug('Got GIS JWT. Validating');
    try {
        const result = await verifyToken(response.credential);
        user.value = result.user;
        userServices.value = result.services;
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

async function verifyToken(jwt: string): Promise<AuthResult> {
    const googleJwt: GoogleJwt = {
        jwt,
    };

    try {

        const result = await restApi.auth.validateGoogleJwt(googleJwt);
        return result;
    } catch {
        throw new Error('Error validating token');
    }
}

const authService = Object.freeze({
    status: computed(() => status.value),
    user: computed(() => user.value),
    userServices: computed(() => userServices.value),
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