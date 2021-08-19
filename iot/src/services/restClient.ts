import { RestClient, RestConfig } from 'netled';

let client: RestClient | undefined;
export function useRestClient(baseUrl?: RestConfig['baseUrl']): RestClient {
    return client ?? (client = new RestClient({ baseUrl }));
}