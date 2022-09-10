
import { RouteOptions } from 'fastify';
import { Id } from '@krakerxyz/netled-core';
import { jwtAuthentication } from '../../services';

export const deleteById: RouteOptions = {
    method: 'DELETE',
    url: '/api/animations/:animationId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                animationId: { type: 'string' }
            },
            required: ['animationId']
        }
    },
    handler: async (req, res) => {
        const animationId = (req.params as any)['animationId'] as Id;

        const db = req.services.animationDb;
        const animation = await db.latestById(animationId);
        if (!animation) {
            await res.status(404).send({ error: 'An animation with that id does not exist' });
            return;
        }

        if (animation.author !== req.user.sub) {
            await res.status(403).send({ error: 'Animation does not belong to authorized user' });
            return;
        }

        if (animation.published) {
            await res.status(400).send({ error: 'Published animation cannot be deleted' });
            return;
        }

        const configs = req.services.animationConfigDb.byAnimationId(animationId, req.user.sub, animation.version);

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