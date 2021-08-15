import { FromDeviceMessage } from './FromDeviceMessage';

export type ToHostMessage = DeviceConnectionEvent | DeviceMessageEvent;

export type DeviceConnectionEvent = {
    deviceId: string;
    type: 'deviceConnection',
    data: DeviceConnectionData
}

export type DeviceConnectionData = {
    state: 'connected' | 'disconnected'
}

export type DeviceMessageEvent = {
    deviceId: string;
    type: 'deviceMessage',
    data: FromDeviceMessage
}

