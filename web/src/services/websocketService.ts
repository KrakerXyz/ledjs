import { HostWsClient } from 'netled';

const ws = new HostWsClient(window.location.host);
export function useWebSocket() {
    return ws;
}
