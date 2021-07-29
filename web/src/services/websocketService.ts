import { HostClient } from 'netled';

const ws = new HostClient(window.location.host);
export function useWebSocket() {
    return ws;
}
