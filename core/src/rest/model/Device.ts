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
    readonly strandId: Id | null
    /** Last stop/start state of the animation on the device */
    readonly isRunning: boolean,
}

export type DevicePost = Pick<Device, 'id' | 'name' | 'spiSpeed'>;
