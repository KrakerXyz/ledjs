import { Id } from '../rest';
import { FromDeviceMessage } from './FromDeviceMessage';

export type ToHostMessage = DeviceConnectionEvent | DeviceMessageEvent;

export type DeviceConnectionEvent = {
    type: 'deviceConnection',
    data: DeviceConnectionData
}

export type DeviceConnectionData = {
    deviceId: string;
    state: 'connected' | 'disconnected'
}

export type DeviceMessageEvent = {
    type: 'deviceMessage',
    data: DeviceMessageEventData
}

export type DeviceMessageEventData = FromDeviceMessage & { deviceId: Id };

