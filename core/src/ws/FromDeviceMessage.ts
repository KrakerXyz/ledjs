
export type FromDeviceMessage = DeviceHealthMessage

export type DeviceHealthMessage = {
    type: 'health',
    data: DeviceHealthData
}

export type DeviceHealthData = Partial<{
    fps: number,
    cpu: number
}>;