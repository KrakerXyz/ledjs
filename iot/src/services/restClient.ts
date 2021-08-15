import { RestClient } from 'netled';

let client: RestClient | undefined;
export function useRestClient(host?: string): RestClient {
    return client ?? (client = new RestClient({ origin: host ? `http://${host}` : 'https://dev.netled.io' }));
}