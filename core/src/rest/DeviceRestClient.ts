import { RestClient } from '.';
import { Config } from '../animation';

export class DeviceRestClient {

    constructor(private readonly restClient: RestClient) { }

    public list<T extends boolean>(includeStatus?: T): Promise<T extends true ? DeviceWithStatus[] : Device[]> {
        return this.restClient.get('/api/devices', { includeStatus });
    }

    public byId<T extends boolean>(deviceId: string, includeStatus?: T): Promise<T extends true ? DeviceWithStatus | null : Device | null> {
        return this.restClient.get(`/api/devices/${deviceId}`, { includeStatus });
    }

    public save(device: DevicePost): Promise<Device> {
        return this.restClient.post('/api/devices', device);
    }

}

export interface Device {
    readonly id: string;
    readonly userId: string;
    readonly secret: string;
    readonly created: number;
    name: string;
}

export type DeviceWithStatus = Device & { status: DeviceStatus }

export type DevicePost = Pick<Device, 'id' | 'name'>;

export interface DeviceStatus {
    lastContact?: number;
    isOnline: boolean;
    localIp?: string;
    wanIp?: string;
    animation?: {
        id: string;
        version: string;
        config?: Config<any>
    }
}

export interface DeviceLog {
    level: 'debug' | 'info' | 'warning' | 'error',
    message: string;
    messageRaw?: string;
    args: any[]
}