import { Id } from '..';
import { DeviceLogLevel, DeviceLogType } from '../..';

/** Filter options for deviceRestClient.logs */
export type DeviceLogsFilter = DeviceLogFilterLog | DeviceLogFilterGeneric

interface DeviceLogFilterLog extends DeviceLogFilterBase {
    /** Include logs of type */
    type: DeviceLogType.Log,

    /** Filter logs by level */
    level?: {
        /** Include logs of level greater-than-or-equal-to */
        start?: DeviceLogLevel | number,
        /** Include logs of level less-than */
        end?: DeviceLogLevel | number
    }
}

interface DeviceLogFilterGeneric extends DeviceLogFilterBase {
    /** Include logs of type */
    type?: DeviceLogType.Info | DeviceLogType.Health;
}

interface DeviceLogFilterBase {
    /** Include logs for device id(s) */
    deviceIds?: [Id, ...Id[]] | null;

    created?: {
        /** Include logs that were created after time */
        after?: number;
        /** Include logs that were created before time */
        before?: number;
    }
}

