
export type FromDeviceMessage = DeviceHealthMessage

/** Device health metrics message */
export type DeviceHealthMessage = {
    type: 'health',
    /** Device health metrics */
    data: DeviceHealthData
}

/** Device health metrics */
export type DeviceHealthData = Partial<{
    /** Average LED frames-per-second */
    fps: number,
    /** CPU utilization */
    cpu: [number, number, number]
}>;