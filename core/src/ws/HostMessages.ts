
export type ToHostMessage = DeviceConnectionEvent

export type DeviceConnectionEvent = {
    deviceId: string;
    type: 'deviceConnection',
    data: DeviceConnectionData
}

export type DeviceConnectionData = {
    state: 'connected' | 'disconnected'
}

