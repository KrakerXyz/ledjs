import { RestClient } from './RestClient';

export class AuthRestClient {

    constructor(private readonly restClient: RestClient) { }

    public validateGoogleToken(token: GoogleToken): Promise<User> {
        return this.restClient.post<User>('api/auth/google-token', token);
    }

}

/** A google auto token to be exchanged for an API token */
export interface GoogleToken {

    /** The id token returned from a google sign-in request */
    idToken: string;

}

export interface User {
    readonly id: string;
    readonly email: string;
    readonly created: number;
    /** Time stamp of the last time a authenticated service was used. Could be off by 15 minutes. */
    readonly lastSeen: number;
}