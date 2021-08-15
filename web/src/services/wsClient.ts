import { Disposable, HostWsClient } from 'netled';
import { getCurrentInstance, onUnmounted } from 'vue';

type WsClient = Pick<HostWsClient, 'on'>;

let ws: HostWsClient | null = null;
let refCount = 0;
export function useWsClient(): WsClient {

    const component = getCurrentInstance();

    if (!component) {
        console.warn('useWsClient was called outside of setup or after awaits');
    }

    if (!ws) {
        ws = new HostWsClient({ host: window.location.host });
    }

    const subscriptions: Disposable[] = [];

    const wsClient: WsClient = {
        on(t, cb) {
            const thisDisposable = ws!.on(t, cb);
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
    }, component);

    return wsClient;

}