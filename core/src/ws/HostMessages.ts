import type { Id } from '../rest/model/Id.js';
import type { FromDeviceMessage } from './FromDeviceMessage.js';


export type ToHostMessage = DeviceConnectionEvent | DeviceMessageEvent;

export interface DeviceConnectionEvent {
    type: 'deviceConnection',
    data: DeviceConnectionData,
}

export interface DeviceConnectionData {
    deviceId: string,
    state: 'connected' | 'disconnected',
}

export interface DeviceMessageEvent {
    type: 'deviceMessage',
    data: DeviceMessageEventData,
}

export type DeviceMessageEventData = FromDeviceMessage & { deviceId: Id };

