import { RestClient } from 'netled';

let client: RestClient | undefined;
export function useRestClient(): RestClient {
    return client ?? (client = new RestClient());
}