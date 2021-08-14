import { Disposable } from '..';
import { DeviceConnectionData, ToHostMessage } from './HostMessages';

export class HostWsClient {

    public constructor(private readonly host: string) {

    }

    private _disposed = false;
    private _reconnectRetryCount = 0;
    private _ws: WebSocket | null = null;
    private startWebsocket() {
        if (this._disposed) { throw new Error('This HostWsClient has been disposed'); }
        if (this._ws) { return; }

        const ws = new WebSocket(`${this.host.includes('localhost') ? 'ws' : 'wss'}://${this.host}/ws/client`);
        this._ws = ws;

        ws.addEventListener('open', () => {
            console.log('WebSocket opened');
            this._reconnectRetryCount = 0;
        });

        ws.addEventListener('error', () => {
            //Just eat it. This will emit if there's an error connecting but a subsequent close will also be emitted which we'll handle. If we don't have this, it'll end up throwing an exception which will crash the app
        });

        ws.addEventListener('close', e => {

            if (this._disposed) {
                return;
            }

            //Will happen if the server closes or after an error has occurred while connecting
            if (e.code === 4001) {
                console.error('WebSocket not authorized');
                return;
            }

            this._reconnectRetryCount++;
            this._ws = null; //so that startWebsocket does not immediately return

            const retryWaitSecs = Math.min(this._reconnectRetryCount, 15);
            console.warn(`WebSocket closed. Attempting reconnect #${this._reconnectRetryCount} in ${retryWaitSecs}secs`, { wasClean: e.wasClean, code: e.code, reason: e.reason });
            setTimeout(() => {
                this.startWebsocket();
            }, retryWaitSecs * 1000);
        });

        ws.addEventListener('message', e => {
            try {
                const message = JSON.parse(e.data) as ToHostMessage;
                this.processMessage(message);

            } catch (e) {
                console.error(`Error parsing incoming WebSocket message - ${e}`);
            }
        });

    }

    private readonly _listeners: Map<ToHostMessage['type'], ((deviceId: string, data: any) => void)[]> = new Map();
    private processMessage(msg: ToHostMessage) {
        console.log(`Incoming WS message ${msg.type}`);
        const callbacks = this._listeners.get(msg.type) ?? [];
        callbacks.forEach(cb => cb(msg.deviceId, msg.data));
    }

    public onDeviceConnectionEvent(cb: (deviceId: string, data: DeviceConnectionData) => void) {
        return this.addListener('deviceConnection', cb);
    }

    private addListener(type: ToHostMessage['type'], cb: any): Disposable {

        this.startWebsocket();

        let arr = this._listeners.get(type);
        if (!arr) { this._listeners.set(type, (arr = [])); }

        arr.push(cb);
        let disposed = false;
        return {
            dispose: () => {
                if (disposed) {
                    throw new Error('Disposable has already been disposed');
                }
                disposed = true;
                const newArr = this._listeners.get(type) ?? [];
                const index = newArr.findIndex(i => i === cb);
                console.assert(index !== -1);
                newArr.splice(index, 1);

                if (!newArr.length) {
                    this._listeners.delete(type);
                }

                if (!this._listeners.size && this._ws) {
                    setTimeout(() => {
                        if (this._listeners.size || !this._ws) { return; }
                        console.log('All listeners removed, closing websocket');
                        this._ws.close();
                        this._ws = null;
                    }, 5000);
                }
            }
        };
    }

    /** Immediately removes all listeners and disposes the websocket */
    public dispose() {
        if (this._disposed) { throw new Error('This HostWsClient has already been disposed'); }
        this._disposed = true;
        this._listeners.clear();
        this._ws?.close();
        this._ws = null;
    }

}