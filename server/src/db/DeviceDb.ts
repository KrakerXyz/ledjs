import { TypedEntity } from '@krakerxyz/typed-base';
import { Device, Id, Writeable } from '@krakerxyz/netled-core';

export class DeviceDb {

    private readonly entity = new TypedEntity<Device>();

    public byId(id: Id): Promise<Writeable<Device> | null> {
        return this.entity.findOneAsync({ id });
    }

    public byUserId(userId: Id): AsyncGenerator<Writeable<Device>> {
        return this.entity.find({ userId });
    }

    public byAnimationNamedConfigId(animationNamedConfigId: Id): AsyncGenerator<Writeable<Device>> {
        return this.entity.find({ animationNamedConfigId });
    }

    public add(device: Device): Promise<void> {
        return this.entity.insertAsync(device);
    }

    public replace(device: Device): Promise<void> {
        return this.entity.replaceOneAsync(device);
    }

    public deleteById(id: Id): Promise<void> {
        return this.entity.deleteOneAsync(id);
    }

}