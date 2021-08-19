
import { FromDeviceMessage, ToDeviceMessage } from '..';
import { AnimationConfig } from '../rest';
import { AnimationStopData, DeviceSetupData } from './ToDeviceMessages';
import { WsConnection, WsOptions, WsCallbacks, WsEvents } from './WsConnection';

type DeviceCallbacks = {
    [T in ToDeviceMessage['type']]: T extends 'animationSetup' ? (data: AnimationConfig | null) => void
    : T extends 'deviceSetup' ? (data: DeviceSetupData) => void
    : T extends 'animationStop' ? (data: AnimationStopData) => void
    : never
}

type DeviceWsCallbacks = WsCallbacks<ToDeviceMessage, DeviceCallbacks>;

export class DeviceWsClient {

    private readonly _ws: WsConnection<ToDeviceMessage, DeviceCallbacks, FromDeviceMessage>;

    public constructor(readonly deviceId: string, readonly deviceSecret: string, readonly options?: Partial<DeviceWsOptions>) {
        const auth = `${deviceId}:${deviceSecret}`;
        this._ws = new WsConnection('device', {
            ...options ?? {},
            auth
        });
    }

    public on<Type extends WsEvents<ToDeviceMessage>>(type: Type, callback: DeviceWsCallbacks[Type]) {
        return this._ws.on(type, callback);
    }

    public postMessage(msg: FromDeviceMessage): void {
        this._ws.postMessage(msg);
    }

    public get isConnected() { return this._ws.isConnected; }

    /** Immediately removes all listeners and disposes the websocket */
    public dispose(): void {
        this._ws.dispose();
    }
}

export type DeviceWsOptions = Pick<WsOptions, 'baseUrl'>;