import { RestClient } from '.';
import { Config } from '../animation';

export class DeviceRestClient {

    constructor(private readonly restClient: RestClient) { }

    public list<T extends boolean>(includeStatus?: T): Promise<T extends true ? Device[] : Omit<Device, 'status'>[]> {
        return this.restClient.get('/api/devices', { includeStatus });
    }

    public byId<T extends boolean = false>(deviceId: string, includeStatus?: T): Promise<T extends true ? Device | null : Omit<Device, 'status'> | null> {
        return this.restClient.get(`/api/devices/${deviceId}`, { includeStatus });
    }

    public save(device: DevicePost): Promise<Device> {
        return this.restClient.post('/api/devices', device);
    }

    public setLedSetup(setup: DeviceLedsSetupPost): Promise<void> {
        return this.restClient.post('/api/devices/leds-setup', setup);
    }

}

export interface Device {
    readonly id: string;
    userId: string;
    secret: string;
    created: number;
    status: DeviceStatus;
    name: string;
}

export type DevicePost = Pick<Device, 'id' | 'name'>;

export interface DeviceStatus {
    lastContact?: number;
    isOnline: boolean;
    localIp?: string;
    wanIp?: string;
    ledsSetup?: DeviceLedsSetup;
}

export interface DeviceLog {
    level: 'debug' | 'info' | 'warning' | 'error',
    message: string;
    messageRaw?: string;
    args: any[]
}

export interface DeviceLedsSetupPost {
    deviceIds: string[],
    setup: DeviceLedsSetup
}

export interface DeviceLedsSetup {
    animation: DeviceLedsSetupAnimation;
    numLeds: number;
    interval: number;
}

export interface DeviceLedsSetupAnimation {
    id: string;
    version: number;
    config?: Config<any>;
}
