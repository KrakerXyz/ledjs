import { RestClient } from './RestClient';

export class AuthClient {

    constructor(private readonly restClient: RestClient) { }

    public validateGoogleToken(token: GoogleToken): Promise<void> {
        return this.restClient.post<void>('api/auth/google-token', token);
    }

}

/** A google auto token to be exchanged for an API token */
export interface GoogleToken {

    /** The id token returned from a google sign-in request */
    idToken: string;

}