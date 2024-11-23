import type { Id } from './model/Id.js';
import type { RestClient } from './RestClient.js';

export class AuthRestClient {

    constructor(private readonly restClient: RestClient) { }

    public validateGoogleToken(token: GoogleToken): Promise<User> {
        return this.restClient.post<User>('/api/auth/google-token', token);
    }

    /** Validate a JWT provided by GIS (one-tap) login */
    public validateGoogleJwt(googleJwt: GoogleJwt): Promise<User> {
        return this.restClient.post<User>('/api/auth/google-jwt', googleJwt);
    }

}

/** A google auto token to be exchanged for an API token */
export interface GoogleToken {

    /** The id token returned from a google sign-in request */
    idToken: string,

}

export interface GoogleJwt {
    /** JWT returned by a GIS login */
    jwt: string,
}

export interface User {
    readonly id: Id,
    readonly email: string,
    readonly created: number,
    /** Time stamp of the last time a authenticated service was used. Could be off by 15 minutes. */
    readonly lastSeen: number,
    avatarUrl: string | null,
}