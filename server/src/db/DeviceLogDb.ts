import type { Filter } from 'mongodb';
import type { DeviceLog, DeviceLogBase } from './domainModel/DeviceLog.js';
import { jsonSchemas } from './schema/schemaUtility.js';
import { Db } from './Db.js';
import type { DeviceLogsFilter } from '../../../core/src/rest/model/DeviceLog.js';


export class DeviceLogDb {    
    private static _entity: Db<DeviceLog>;

    public constructor() {
        DeviceLogDb._entity ??= new Db<DeviceLog>('deviceLogs', jsonSchemas.deviceLog);
    }

    public add(deviceLog: DeviceLog): Promise<void> {
        return DeviceLogDb._entity.insertAsync(deviceLog);
    }

    public get(filter: DeviceLogsFilter, limit?: number): AsyncGenerator<DeviceLogBase> {
        const mdbFilter: Filter<DeviceLog> = { from: 'device' };

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

        return DeviceLogDb._entity.find(
            mdbFilter,
            undefined,
            { limit, sort: { created: -1 } }
        );
    }

}