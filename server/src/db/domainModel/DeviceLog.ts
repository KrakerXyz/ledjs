import type { Id } from '../../../../core/src/rest/model/Id.js';
import type { DeviceHealthMessage, DeviceInfoMessage } from '../../../../core/src/ws/FromDeviceMessage.js';
import type { DeviceConnectionEvent } from '../../../../core/src/ws/HostMessages.js';

export interface DeviceLogBase {
    id: Id,
    deviceId: Id,
    from: 'server' | 'device',
    created: number,
    data: Record<string, any>,
}

export type DeviceLog = DeviceLogMessage | ServerDeviceMessage;

export interface ServerDeviceMessage extends DeviceLogBase {
    from: 'server',
    data: ServerDeviceSocketSendMessage | DeviceConnectionEvent,
}

export interface ServerDeviceSocketSendMessage {
    type: 'websocketSendMessage',
    msgType: string,
}

export interface DeviceLogMessage extends DeviceLogBase {
    from: 'device',
    data: DeviceHealthMessage | DeviceInfoMessage | DeviceLogMessage,
}