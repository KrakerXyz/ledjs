import { TypedEntity } from '@krakerxyz/typed-base';
import { Device } from 'netled';
import { Writeable } from '.';

export class DeviceDb {

    private readonly entity = new TypedEntity<Device>();

    public byId(id: string): Promise<Writeable<Device> | null> {
        return this.entity.findOneAsync({ id });
    }

    public byUserId(userId: string): AsyncGenerator<Writeable<Device>> {
        return this.entity.find({ userId });
    }

    public add(device: Device): Promise<void> {
        return this.entity.insertAsync(device);
    }

    public replace(device: Device): Promise<void> {
        return this.entity.replaceOneAsync(device);
    }

}