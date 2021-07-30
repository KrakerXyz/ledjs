import { TypedEntity } from '@krakerxyz/typed-base';
import { Device } from 'netled';

export class DeviceDb {

    private readonly entity = new TypedEntity<Device>();

    public byUserId(userId: string): AsyncGenerator<Device> {
        return this.entity.find({ userId });
    }

    public add(device: Device): Promise<void> {
        return this.entity.insertAsync(device);
    }

    public replace(device: Device): Promise<void> {
        return this.entity.replaceOneAsync(device);
    }

}