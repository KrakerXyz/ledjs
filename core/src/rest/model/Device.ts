import { Id } from './Id.js';

export interface Device {
    /** GUID id of the device */
    readonly id: Id,
    /** GUID id of the user the device belongs to */
    readonly userId: Id,
    /** A name for the device, given by the user */
    name: string,
    /** API secret used for device to server authentication */
    readonly secret: string,
    /** Timestamp of when the device was created */
    readonly created: number,
    /** Speed in MHz to run the SPI interface at */
    spiSpeed: number,
    /** Various status details for the device. */
    readonly status: DeviceStatus,
    readonly strandId: Id | null
    /** Last stop/start state of the animation on the device */
    readonly isRunning: boolean,
}

export type DevicePost = Pick<Device, 'id' | 'name' | 'spiSpeed'>;

export interface DeviceStatus {
    /** Last time the device made a call to the server */
    readonly lastSeen?: number,
    /** Timestamp of when the device last connected */
    readonly onlineSince?: number,
    /** Timestamp of when the device last disconnected */
    readonly offlineSince?: number,
    /** The LAN IP of the device */
    readonly localIp?: string,
    /** The WAN IP address the device connected from */
    readonly wanIp?: string,
}
