import { Disposable, HostWsClient } from 'netled';
import { onUnmounted } from 'vue';

type WsClient = Pick<HostWsClient, 'onDeviceConnectionEvent'>;

let ws: HostWsClient | null = null;
let refCount = 0;
export function useWsClient(): WsClient {

    if (!ws) {
        ws = new HostWsClient(window.location.host);
    }

    const subscriptions: Disposable[] = [];

    const wsClient: WsClient = {
        onDeviceConnectionEvent(cb) {
            const thisDisposable = ws!.onDeviceConnectionEvent(cb);
            subscriptions.push(thisDisposable);
            return {
                dispose() {
                    const index = subscriptions.findIndex(s => s === thisDisposable);
                    console.assert(index !== -1);
                    subscriptions.splice(index, 1);
                    thisDisposable.dispose();
                }
            };
        }
    };

    refCount++;
    onUnmounted(() => {

        subscriptions.forEach(sub => sub.dispose());

        refCount--;
        if (!refCount) {
            setTimeout(() => {
                if (refCount) { return; }
                ws?.dispose();
                ws = null;
            }, 1000);
        }
    });

    return wsClient;

}