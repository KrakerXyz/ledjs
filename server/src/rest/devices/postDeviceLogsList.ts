import { jsonSchema } from '@krakerxyz/json-schema-transformer';
import { DeviceLogsFilter, FromDeviceMessageLog, Id } from '@krakerxyz/netled-core';
import { RouteOptions } from 'fastify';
import { awaitAll, jwtAuthentication } from '../../services';

export const postDeviceLogsList: RouteOptions = {
    method: 'POST',
    url: '/api/devices/logs/list',
    preValidation: [jwtAuthentication],
    schema: {
        body: jsonSchema<DeviceLogsFilter>(),
        // Having this on causes an error and I can't figure out why. 
        // https://github.com/fastify/help/issues/424
        response: {
            200: jsonSchema<FromDeviceMessageLog[]>()
        }
    },
    handler: async (req, res) => {

        const db = req.services.deviceDb;

        const filter = req.body as DeviceLogsFilter;

        if (filter.deviceIds) {
            const devices = await Promise.all(filter.deviceIds.map(did => db.byId(did)));

            if (devices.some(d => !d)) {
                res.status(400).send('One or more devices did not exist');
                return;
            }

            if (devices.some(d => d?.userId !== req.user.sub)) {
                res.status(403).send('User does not have access to one or more devices');
                return;
            }
        } else {
            const userDevices = await db.byUserId(req.user.sub);
            const ids: Id[] = [];
            for await (const d of userDevices) {
                ids.push(d.id);
            }
            if (!ids.length) {
                //If user has no devices, there wont be any logs
                res.send([]);
                return;
            }
            filter.deviceIds = ids as [Id, ...Id[]];
        }

        const logsGen = req.services.deviceLogDb.get(filter, 100);
        const logs = await awaitAll(logsGen);

        const logData = logs.map(l => ({ ...l.data, created: l.created }));

        res.send(logData);
    }
};