import { DeviceAnimationConfigPost, DeviceLogsFilter, Id, RestClient, AnimationVersion } from '.';
import { FromDeviceMessage } from '..';

export class DeviceRestClient {

    constructor(private readonly restClient: RestClient) { }

    /** Get a list of devices */
    public list<T extends boolean>(includeStatus?: T): Promise<T extends true ? Device[] : DeviceSummary[]> {
        return this.restClient.get('/api/devices', { includeStatus });
    }

    /** Get a device by it's id */
    public byId<T extends boolean = false>(deviceId: string, includeStatus?: T): Promise<T extends true ? Device | null : DeviceSummary | null> {
        return this.restClient.get(`/api/devices/${deviceId}`, { includeStatus });
    }

    /** Create/save a device */
    public save(device: DevicePost): Promise<Device> {
        return this.restClient.post('/api/devices', device);
    }

    /** Delete a device */
    public delete(deviceId: Id): Promise<void> {
        return this.restClient.delete(`/api/devices/${deviceId}`);
    }

    /** Resets the device back to it's stored animation config */
    public resetAnimation(reset: DeviceAnimationResetPost): Promise<void> {
        return this.restClient.post('/api/devices/animation/reset', reset);
    }

    /** Sets the device to rendering a specific animation without storing it on the device. */
    public setAnimation(setup: DeviceAnimationPost): Promise<void> {
        return this.restClient.post('/api/devices/animation', setup);
    }

    /** Stores a animation config to the device so that it'll render on startup */
    public setAnimationConfig(post: DeviceAnimationConfigPost): Promise<void> {
        return this.restClient.post('/api/devices/animation-config', post);
    }

    /** Set device animation clock to a paused/running state without changing the current animation */
    public stopAnimation(stop: DeviceStopPost): Promise<void> {
        return this.restClient.post('/api/devices/animation/stop', stop);
    }

    /** Gets a list of logs emitted by devices. Sorted in reverse chronological order base on created. Returns max of 100 records. */
    public logs(filter?: DeviceLogsFilter): Promise<FromDeviceMessageLog[]> {
        return this.restClient.post('/api/devices/logs/list', filter ?? {});
    }

}

export type FromDeviceMessageLog = FromDeviceMessage & {
    id: Id;
    created: number;
}

export interface Device {
    /** GUID id of the device */
    readonly id: Id;
    /** GUID id of the user the device belongs to */
    readonly userId: Id;
    /** A name for the device, given by the user */
    name: string;
    /** API secret used for device to server authentication */
    readonly secret: string;
    /** Timestamp of when the device was created */
    readonly created: number;
    /** LED setup details */
    setup: DeviceSetup;
    /** Various status details for the device. */
    readonly status: DeviceStatus;
    /** Id of named animation config assigned to this device */
    readonly animationNamedConfigId?: Id
    /** Last stop/start state of the animation on the device */
    readonly isStopped: boolean;
}

/** Device object without the current animation, or status */
export type DeviceSummary = Omit<Device, 'status' | 'animation'>

export type DevicePost = Pick<Device, 'id' | 'name' | 'setup'>;

export interface DeviceStatus {
    /** Last time the device made a call to the server */
    readonly lastContact?: number;
    /** Timestamp of when the device last connected */
    readonly cameOnline: number;
    /** Timestamp of when the device last went offline */
    readonly wentOffline: number;
    /** The LAN IP of the device */
    readonly localIp?: string;
    /** The WAN IP address the device connected from */
    readonly wanIp?: string;
}

export interface DeviceSetup {
    /** Number of LEDs connected to the SPI interface */
    numLeds: number;
    /** Speed in MHz to run the SPI interface at */
    spiSpeed: number;
}

export interface DeviceAnimationPost {
    /** One or more device ids to send the stop request to. */
    deviceIds: [Id, ...Id[]],
    /** Animation and configuration to run on devices */
    animation: {
        id: Id;
        version: AnimationVersion
    },
    /** Optional id of the saved config to use for the animation */
    configId?: Id;
}

export interface DeviceStopPost {
    /** One or more device ids to send the stop request to. */
    deviceIds: [Id, ...Id[]],
    /** When or not to stop the animation. Send false to restart a previously stopped animation. */
    stop: boolean;
    /** Whether or not to store this stop state on the device. Defaults to true */
    persist?: boolean;
}

/** Resets the device back to it's stored animation config */
export interface DeviceAnimationResetPost {
    deviceIds: [Id, ...Id[]];
}
