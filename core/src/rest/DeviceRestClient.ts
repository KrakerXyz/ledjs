
import { Device, DevicePost } from './model/Device.js';
import type { Id } from './model/Id.js';
import type { RestClient } from './RestClient.js';


export class DeviceRestClient {

    constructor(private readonly restClient: RestClient) { }

    /** Get a list of devices */
    public list(): Promise<Device[]> {
        return this.restClient.get('/api/devices');
    }

    /** Get a device by it's id */
    public byId(deviceId: string): Promise<Device | null> {
        return this.restClient.get(`/api/devices/${deviceId}`);
    }

    /** Create/save a device */
    public save(device: DevicePost): Promise<Device> {
        return this.restClient.post('/api/devices', device);
    }

    /** Delete a device */
    public delete(deviceId: Id): Promise<void> {
        return this.restClient.delete(`/api/devices/${deviceId}`);
    }

    public setStrand(deviceId: Id, strandId: Id | null): Promise<void> {
        return this.restClient.post(`/api/devices/${deviceId}/strand`, { strandId });
    }

    public setRunning(deviceId: Id, running: boolean): Promise<void> {
        return this.restClient.post(`/api/devices/${deviceId}/running`, { running });
    }

}