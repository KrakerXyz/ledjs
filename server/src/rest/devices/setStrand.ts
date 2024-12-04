import type { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import type { Id } from '../../../../core/src/rest/model/Id.js';

interface Params {
    deviceId: Id
}

interface Body {
    strandId: Id | null
}

export const setStrand: RouteOptions = {
    method: 'POST',
    url: '/api/devices/:deviceId/strand',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const { deviceId } = req.params as Params;
        const { strandId } = req.body as Body;

        const db = req.services.deviceDb;
        const device = await db.byId(deviceId);

        if (!device || device.userId !== req.user.sub) {
            await res.status(404).send({ error: 'Device not found for user' });
            return;
        }

        if (strandId === device.strandId) {
            await res.status(400).send({ error: `Strand ${strandId} is already set` });
            return;
        }

        if (strandId !== null) {
            const strandDb = req.services.strandDb;
            const strand = await strandDb.byId(strandId);
            if (!strand) {
                await res.status(400).send({ error: 'Strand not found' });
                return;
            }
        }

        device.strandId = strandId;
        await db.upsert(device);

        req.services.mqtt.publishDeviceAction(deviceId, 'strand-changed', strandId ?? '');

        await res.status(200).send();
    }
};

