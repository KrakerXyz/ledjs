
import { RouteOptions } from 'fastify';
import { Id } from '@krakerxyz/netled-core';
import { jwtAuthentication } from '../../services';
import { jsonSchema } from '@krakerxyz/json-schema-transformer';

type Params = { animationId: Id };

export const deleteById: RouteOptions = {
    method: 'DELETE',
    url: '/api/animations/:animationId',
    preValidation: [jwtAuthentication],
    schema: {
        params: jsonSchema<Params>()
    },
    handler: async (req, res) => {
        const params = req.params as Params;

        const db = req.services.animationDb;
        const animation = await db.byId(params.animationId, 'draft');
        if (!animation) {
            await res.status(404).send({ error: `A draft animation ${params.animationId} does not exist` });
            return;
        }

        if (animation.author !== req.user.sub) {
            await res.status(403).send({ error: 'Animation does not belong to authorized user' });
            return;
        }

        const configs = req.services.animationConfigDb.byAnimationId(params.animationId, req.user.sub, animation.version);

        const deviceIdsToReset: Id[] = [];
        for await (const config of configs) {
            const devices = req.services.deviceDb.byAnimationConfigId(config.id);
            for await (const device of devices) {
                device.animationConfigId = null;
                await req.services.deviceDb.replace(device);
                deviceIdsToReset.push(device.id);
            }

            await req.services.animationConfigDb.deleteById(config.id);
        }

        if (deviceIdsToReset.length) {
            req.services.webSocketManager.sendDeviceMessage({
                type: 'animationSetup',
                data: null
            }, deviceIdsToReset[0], ...deviceIdsToReset.slice(1));
        }

        await db.deleteById(animation.id, animation.version);

        await res.status(200).send();
    }
};