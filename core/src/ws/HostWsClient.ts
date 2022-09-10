
import { DeviceConnectionData, DeviceMessageEventData, ToHostMessage } from './HostMessages';
import { WsCallbacks, WsConnection, WsEvents, WsOptions } from './WsConnection';

type HostCallbacks = {
    [T in ToHostMessage['type']]: T extends 'deviceConnection' ? (data: DeviceConnectionData) => void
        : T extends 'deviceMessage' ? (data: DeviceMessageEventData) => void
            : never
}

type HostWsCallbacks = WsCallbacks<ToHostMessage, HostCallbacks>;

export class HostWsClient {

    private readonly _ws: WsConnection<ToHostMessage, HostCallbacks, never>;

    public constructor(readonly options?: Partial<HostWsOptions>) {
        this._ws = new WsConnection('client', {
            ...options ?? {},
        });
    }

    public on<Type extends WsEvents<ToHostMessage>>(type: Type, callback: HostWsCallbacks[Type]) {
        return this._ws.on(type, callback);
    }

    public get isConnected() { return this._ws.isConnected; }

    /** Immediately removes all listeners and disposes the websocket */
    public dispose(): void {
        this._ws.dispose();
    }

}


export type HostWsOptions = Pick<WsOptions, 'baseUrl'>;