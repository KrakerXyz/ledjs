import { RestClient } from '.';
import { Config } from '../animation';

export class DeviceRestClient {

    constructor(private readonly restClient: RestClient) { }

    public list<T extends boolean>(includeStatus?: T): Promise<T extends true ? Device[] : DeviceShallow[]> {
        return this.restClient.get('/api/devices', { includeStatus });
    }

    public byId<T extends boolean = false>(deviceId: string, includeStatus?: T): Promise<T extends true ? Device | null : DeviceShallow | null> {
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
    numLeds: number;
    name: string;
}

export type DeviceShallow = Omit<Device, 'status'>

export type DevicePost = Pick<Device, 'id' | 'name' | 'numLeds'>;

export interface DeviceStatus {
    lastContact?: number;
    isOnline: boolean;
    localIp?: string;
    wanIp?: string;
    animation?: DeviceLedsAnimationSetup;
}

export interface DeviceLog {
    level: 'debug' | 'info' | 'warning' | 'error',
    message: string;
    messageRaw?: string;
    args: any[]
}

export interface DeviceLedsSetupPost {
    deviceIds: string[],
    animation: DeviceLedsAnimationSetup
}

export interface DeviceLedsAnimationSetup {
    id: string;
    version: number;
    config?: Config<any>;
    interval: number;
}
