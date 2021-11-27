import { RestClient, RestConfig } from '@krakerxyz/netled-core';

let client: RestClient | undefined;
export function useRestClient(baseUrl?: RestConfig['baseUrl']): RestClient {
    return client ?? (client = new RestClient({ baseUrl }));
}