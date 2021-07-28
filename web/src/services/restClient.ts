
import { RestClient, RestConfig } from 'netled';

let restClient: RestClient | undefined;
export function useRestClient(): RestClient {
    return restClient ?? (restClient = new RestClient({ origin: window.location.origin as RestConfig['origin'] }));
}