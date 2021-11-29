
export type FromDeviceMessage = DeviceHealthMessage | DeviceInfoMessage | DeviceLogMessage;

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

/** Device log messages */
export type DeviceLogMessage = {
    type: 'log',
    data: DeviceLogData
}

export type DeviceLogData = {
    /** The level of the log. Default levels start at debug:20, info:30, warn:40, error:50, fatal:60 */
    level: number;
    /** The time (ticks) on the device at time of log */
    time: number;
    /** The name of the logger that produced the message */
    name: string;
    /** The message */
    msg: string;
    [key: string]: any
}

/** Information about the device's hardware and software */
export type DeviceInfoMessage = {
    type: 'info',
    /** Information about the device's hardware and software */
    data: DeviceInfoData,
}

/** Information about the device's hardware and software */
export type DeviceInfoData = {
    /** The os that the device is running */
    os: string;
    /** Number of processor cores */
    cores: number;
    /** Information from the package.json file */
    package: {
        name: string;
        version: string;
    }
}