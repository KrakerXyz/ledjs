
import { Disposable, ToDeviceMessage } from '..';
import { DeviceAnimationSetup } from '../rest';
import { AnimationStopData, DeviceSetupData } from './DeviceMessages';
import * as WebSocket from 'ws';

export class DeviceWsClient {

    public constructor(host: string, deviceId: string, deviceSecret: string) {

        let reconnectRetryCount = 0;
        const startWebsocket = () => {

            const authToken = `${deviceId}:${deviceSecret}`;
            const ws = new WebSocket(`ws://${host}/ws/device`, { auth: authToken });

            ws.addEventListener('open', () => {
                console.log('WebSocket opened');
                reconnectRetryCount = 0;
            });

            ws.addEventListener('error', () => {
                //Just eat it. This will emit if there's an error connecting but a subsequent close will also be emitted which we'll handle. If we don't have this, it'll end up throwing an exception which will crash the app
            });

            ws.addEventListener('close', e => {
                //Will happen if the server closes or after an error has occurred while connecting
                if (e.code === 4001) {
                    console.error('Device not authorized to connect to netled. Check your .env DEVICE_ID/SECRET');
                    return;
                }

                reconnectRetryCount++;
                const retryWaitSecs = Math.min(reconnectRetryCount, 15);
                console.warn(`WebSocket closed. Attempting reconnect #${reconnectRetryCount} in ${retryWaitSecs}secs`, { wasClean: e.wasClean, code: e.code, reason: e.reason });
                setTimeout(() => {
                    startWebsocket();
                }, retryWaitSecs * 1000);
            });

            ws.addEventListener('message', e => {
                try {
                    const message = JSON.parse(e.data) as ToDeviceMessage;
                    this.processMessage(message);

                } catch (e) {
                    console.error(`Error parsing incoming WebSocket message - ${e}`);
                }
            });

        };
        startWebsocket();
    }

    private readonly _listeners: Partial<Record<ToDeviceMessage['type'], ((data: any) => void)[]>> = {};
    private processMessage(msg: ToDeviceMessage) {
        console.log(`Incoming WS message ${msg.type}`);
        const callbacks = this._listeners[msg.type] ?? [];
        callbacks.forEach(cb => cb(msg.data));
    }

    public onAnimationSetup(cb: (data: DeviceAnimationSetup) => void): Disposable {
        return this.addListener('animationSetup', cb);
    }

    public onDeviceSetup(cb: (data: DeviceSetupData) => void): Disposable {
        return this.addListener('deviceSetup', cb);
    }

    public onAnimationStop(cb: (data: AnimationStopData) => void): Disposable {
        return this.addListener('animationStop', cb);
    }

    private addListener(type: ToDeviceMessage['type'], cb: any): Disposable {
        const arr = this._listeners[type] ?? (this._listeners[type] = []);
        arr.push(cb);
        let disposed = false;
        return {
            dispose: () => {
                if (disposed) {
                    throw new Error('Disposable has already been disposed');
                }
                disposed = true;
                const newArr = this._listeners[type] ?? [];
                const index = newArr.findIndex(i => i === cb);
                console.assert(index !== -1);
                newArr.splice(index, 1);
            }
        };
    }
}