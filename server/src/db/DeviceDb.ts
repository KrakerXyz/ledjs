
import { Db, UpdateResult } from './Db.js';
import { jsonSchemas } from './schema/schemaUtility.js';
import { Device, Id, Writeable } from '../../../core/src/index.js';

export class DeviceDb {

    private static _entity: Db<Device>;

    public constructor() {
        DeviceDb._entity ??= new Db<Device>('devices', jsonSchemas.device);
    }

    public byId(id: Id): Promise<Writeable<Device> | null> {
        return DeviceDb._entity.findOneAsync({ id });
    }

    public byUserId(userId: Id): AsyncGenerator<Writeable<Device>> {
        return DeviceDb._entity.find({ userId });
    }

    public byDeviceId(deviceId: Id): AsyncGenerator<Writeable<Device>> {
        return DeviceDb._entity.find({ deviceId });
    }

    public byAnimationConfigId(animationConfigId: Id): AsyncGenerator<Writeable<Device>> {
        return DeviceDb._entity.find({ animationConfigId });
    }

    public add(device: Device): Promise<void> {
        return DeviceDb._entity.insertAsync(device);
    }

    public replace(device: Device): Promise<UpdateResult> {
        return DeviceDb._entity.replaceOneAsync(device);
    }

    public upsert(device: Device): Promise<UpdateResult> {
        return DeviceDb._entity.replaceOneAsync(device, { upsert: true });
    }

    public deleteById(id: Id): Promise<void> {
        return DeviceDb._entity.deleteOneAsync(id);
    }

}