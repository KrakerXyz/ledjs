import { ref } from 'vue';
import { AuthRestClient, GoogleJwt, User } from '@krakerxyz/netled-core';
import { useRestClient } from '.';
import Cookies from 'js-cookie';

const status = ref<'signedOut' | 'initializing' | 'signedIn' | 'NOT INITIALIZED'>('NOT INITIALIZED');

const GoogleJwtCookieName = 'g-jwt';

export async function initGoogleLoginButton(container: HTMLDivElement) {
    status.value = 'initializing';

    const cookieJwt = Cookies.get(GoogleJwtCookieName);
    if (cookieJwt) {
        try {
            console.debug('Loading user from existing g-jwt');
            const user = await verifyToken(cookieJwt);
            console.debug('Loaded user from existing g-jwt', user);
            return;
        } catch (e) {
            console.warn('Could not validate existing g-jwt', e);
            Cookies.remove(GoogleJwtCookieName);
        }
    }

    console.debug('Initializing GIS');
    window.addEventListener('load', () => {

        if (!import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
            throw new Error('Missing VITE_GOOGLE_CLIENT_ID environment variable');
            return;
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
        
    }, { once: true });

}

async function handleCredentialResponse(response: google.accounts.id.CredentialResponse): Promise<User | null> {
    console.debug('Encoded JWT ID token: ' + response.credential);
    try {
        const user = await verifyToken(response.credential);
        Cookies.set(GoogleJwtCookieName, response.credential, {
            secure: window.location.protocol === 'https',
            sameSite: 'strict',
            expires: 365
        });
        console.debug('Got NetLed user', user);
        return user;
    } catch (e) {
        console.error('Error verifying token', e);
        Cookies.remove(GoogleJwtCookieName);
        google.accounts.id.disableAutoSelect();
        return null;
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
