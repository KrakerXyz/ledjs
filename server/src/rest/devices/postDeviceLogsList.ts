
import type { RouteOptions } from 'fastify';
import { awaitAll } from '../../services/awaitAll.js';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { DeviceLogsFilter } from '../../../../core/src/rest/model/DeviceLog.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

export const postDeviceLogsList: RouteOptions = {
    method: 'POST',
    url: '/api/devices/logs/list',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {

        const db = req.services.deviceDb;

        const filter = req.body as DeviceLogsFilter;

        if (filter.deviceIds) {
            const devices = await Promise.all(filter.deviceIds.map(did => db.byId(did)));

            if (devices.some(d => !d)) {
                await res.status(400).send('One or more devices did not exist');
                return;
            }

            if (devices.some(d => d?.userId !== req.user.sub)) {
                await res.status(403).send('User does not have access to one or more devices');
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
                await res.send([]);
                return;
            }
            filter.deviceIds = ids as [Id, ...Id[]];
        }

        const logsGen = req.services.deviceLogDb.get(filter, 100);
        const logs = await awaitAll(logsGen);

        const logData = logs.map(l => ({ ...l.data, id: l.id, created: l.created }));

        await res.send(logData);
    }
};