
import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

interface Params {
    deviceId: Id
}

interface Body {
    running: boolean
}

export const setRunning: RouteOptions = {
    method: 'POST',
    url: '/api/devices/:deviceId/running',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const { deviceId } = req.params as Params;
        const { running } = req.body as Body;

        const db = req.services.deviceDb;
        const device = await db.byId(deviceId);

        if (!device) {
            await res.status(404).send({ error: 'Device not found' });
            return;
        }

        if (device.userId !== req.user.sub) {
            await res.status(401).send({ error: 'Device does not belong to you' });
            return;
        }
        if (device.isRunning !== running) {
            device.isRunning = running;
            await db.upsert(device);

            req.services.mqtt.publish(`device/${deviceId}/is-running`, running.toString());
        }

        await res.status(200).send();
    }
};

