import { DeviceLogsFilter } from '@krakerxyz/netled-core';
import { TypedEntity, Filter } from '@krakerxyz/typed-base';
import { DeviceLog, DeviceLogBase, DeviceLogMessage } from './domainModel/DeviceLog';

export class DeviceLogDb {

    private readonly entity = new TypedEntity<DeviceLogBase>();

    public add(deviceLog: DeviceLog): Promise<void> {
        return this.entity.insertAsync(deviceLog);
    }

    public get(filter: DeviceLogsFilter, limit?: number): AsyncGenerator<DeviceLogBase> {
        const mdbFilter: Filter<DeviceLogMessage> = { from: 'device' };

        if (filter.deviceIds?.length) {
            mdbFilter.deviceId = { $in: filter.deviceIds };
        }

        if (filter.type) {
            (mdbFilter as any)['data.type'] = filter.type;
        }

        if (filter.created?.after) {
            mdbFilter.created = { $gt: filter.created.after };
        }

        if (filter.created?.before) {
            mdbFilter.created = { $lt: filter.created.before };
        }

        return this.entity.find(
            mdbFilter as Filter<DeviceLogBase>,
            undefined,
            { limit, sort: { created: -1 } }
        );
    }

}