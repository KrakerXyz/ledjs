import { TypedEntity } from '@krakerxyz/typed-base';
import { DeviceLog, DeviceLogBase } from './domainModel/DeviceLog';

export class DeviceLogDb {

    private readonly entity = new TypedEntity<DeviceLogBase>();

    public add(deviceLog: DeviceLog): Promise<void> {
        return this.entity.insertAsync(deviceLog);
    }

}