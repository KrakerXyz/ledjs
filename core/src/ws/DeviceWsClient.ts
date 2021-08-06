
import { FromDeviceMessage, ToDeviceMessage } from '..';
import { DeviceAnimationSetup } from '../rest';
import { AnimationStopData, DeviceSetupData } from './ToDeviceMessages';
import { WsConnection, WsOptions, Listener, WsCallbacks, WsEvents } from './WsConnection';

type DeviceCallbacks = {
    [T in ToDeviceMessage['type']]: T extends 'animationSetup' ? (data: DeviceAnimationSetup) => void
    : T extends 'deviceSetup' ? (data: DeviceSetupData) => void
    : T extends 'animationStop' ? (data: AnimationStopData) => void
    : never
}

type DeviceWsCallbacks = WsCallbacks<ToDeviceMessage, DeviceCallbacks>;

export class DeviceWsClient {

    private readonly _ws: WsConnection<ToDeviceMessage, DeviceCallbacks, FromDeviceMessage>;

    public constructor(deviceId: string, deviceSecret: string, options?: Partial<DeviceWsOptions>) {
        const auth = `${deviceId}:${deviceSecret}`;
        this._ws = new WsConnection('device', {
            ...options ?? {},
            auth
        });
    }

    public on<Type extends WsEvents<ToDeviceMessage>>(type: Type, callback: DeviceWsCallbacks[Type]): Listener {
        return this._ws.on(type, callback);
    }

    public postMessage(msg: FromDeviceMessage): void {
        this._ws.postMessage(msg);
    }
}

export type DeviceWsOptions = Pick<WsOptions, 'protocol' | 'host'>;