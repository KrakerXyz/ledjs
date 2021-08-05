
export type FromDeviceMessage = DeviceHealthMessage | DeviceInfoMessage;

/** Device health metrics message */
export type DeviceHealthMessage = {
    type: 'health',
    /** Device health metrics */
    data: DeviceHealthData
}

/** Device health metrics */
export type DeviceHealthData = Partial<{
    /** Average LED frames-per-second */
    fps: number;
    /** CPU utilization */
    cpu: [number, number, number];
    /** netled uptime */
    uptime: number;
    /** Number of seconds the device has been powered on */
    uptimeSystem: number;
}>;

/** Information about the device's hardware and software */
export type DeviceInfoMessage = {
    type: 'info',
    /** Information about the device's hardware and software */
    data: DeviceInfoData,
}

/** Information about the device's hardware and software */
export type DeviceInfoData = {
    /** The os that the device is running */
    os: string,
    /** Number of processor cores */
    cores: number
}