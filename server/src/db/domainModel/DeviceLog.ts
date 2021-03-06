import { DeviceConnectionEvent, DeviceHealthMessage, DeviceInfoMessage, Id } from '@krakerxyz/netled-core';

export interface DeviceLogBase {
    id: Id;
    deviceId: Id;
    from: 'server' | 'device';
    created: number;
    data: Record<string, any>;
}

export type DeviceLog = DeviceLogMessage | ServerDeviceMessage;

export interface ServerDeviceMessage extends DeviceLogBase {
    from: 'server';
    data: ServerDeviceSocketSendMessage | DeviceConnectionEvent;
}

export type ServerDeviceSocketSendMessage = {
    type: 'websocketSendMessage';
    msgType: string;
}

export interface DeviceLogMessage extends DeviceLogBase {
    from: 'device'
    data: DeviceHealthMessage | DeviceInfoMessage
}