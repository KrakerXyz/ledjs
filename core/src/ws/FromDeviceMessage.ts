
export type FromDeviceMessage = DeviceHealthMessage | DeviceInfoMessage | DeviceLogMessage;

export enum DeviceLogType {
    Info = 'info',
    Health = 'health',
    Log = 'log'
}

/** Device health metrics message */
export type DeviceHealthMessage = {
    type: DeviceLogType.Health,
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
    type: DeviceLogType.Log,
    data: DeviceLogData
}

export enum DeviceLogLevel {
    Debug = 20,
    Info = 30,
    Warn = 40,
    Error = 50,
    Fatal = 60
}

export type DeviceLogData = {
    /** The severity level of the log */
    level: DeviceLogLevel | number;
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
    type: DeviceLogType.Info,
    /** Information about the device's hardware and software */
    data: DeviceInfoData,
}

/** Information about the device's hardware and software */
export type DeviceInfoData = Partial<{
    /** The os that the device is running */
    os: string;
    /** Number of processor cores */
    cores: number;
    /** Information from the package.json file */
    package: {
        name: string;
        version: string;
    }
}>