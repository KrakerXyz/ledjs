import { WsMessage, WsLedsSetup } from '.';
import { Disposable } from '..';

export class DeviceWsClient {

    public constructor(host: string) {

        console.log('Starting WebSocket');
        const ws = new WebSocket(`ws://${host}/ws?device-id=raspi-netled-1&token=raspi-netled-1`);

        ws.addEventListener('open', () => {
            console.log('WebSocket opened');
        });

        ws.addEventListener('close', e => {
            //Will happen if the server closes or after an error has occurred while connecting
            console.warn('WebSocket closed', { wasClean: e.wasClean, code: e.code, reason: e.reason });
        });

        ws.addEventListener('message', e => {
            try {
                const message = JSON.parse(e.data) as WsMessage;
                this.processMessage(message);

            } catch (e) {
                console.error(`Error parsing incoming WebSocket message - ${e}`);
            }
        });
    }

    private readonly _listeners: Partial<Record<WsMessage['type'], ((data: WsMessage['data']) => void)[]>> = {};
    private processMessage(msg: WsMessage) {
        const callbacks = this._listeners[msg.type] ?? [];
        callbacks.forEach(cb => cb(msg.data));
    }

    public onLedSetup(cb: (data: WsLedsSetup) => void): Disposable {
        const arr = this._listeners['ledSetup'] ?? (this._listeners['ledSetup'] = []);
        arr.push(cb);
        let disposed = false;
        return {
            dispose: () => {
                if (disposed) {
                    throw new Error('Disposable has already been disposed');
                }
                disposed = true;
                const newArr = this._listeners['ledSetup'] ?? [];
                const index = newArr.findIndex(i => i === cb);
                console.assert(index !== -1);
                newArr.splice(index, 1);
            }
        };
    }


}