
import { RouteOptions } from 'fastify';
import { Id } from '@krakerxyz/netled-core';
import { jwtAuthentication } from '../../services';

export const deleteConfigById: RouteOptions = {
    method: 'DELETE',
    url: '/api/animations/configs/:configId',
    preValidation: [jwtAuthentication],
    schema: {
        params: {
            type: 'object',
            properties: {
                configId: { type: 'string', format: 'uuid' }
            },
            required: ['configId']
        }
    },
    handler: async (req, res) => {
        const configId = (req.params as any)['configId'] as Id;

        const config = await req.services.animationConfigDb.byId(configId);
        if (!config) {
            res.status(404).send({ error: 'A config with that id does not exist' });
            return;
        }

        if (config.userId !== req.user.sub) {
            res.status(403).send({ error: 'Config does not belong to authorized user' });
            return;
        }
        const deviceIdsToReset: Id[] = [];
        const devices = req.services.deviceDb.byAnimationNamedConfigId(config.id);
        for await (const device of devices) {
            device.animationNamedConfigId = undefined;
            await req.services.deviceDb.replace(device);
            deviceIdsToReset.push(device.id);
        }

        await req.services.animationConfigDb.deleteById(config.id);


        if (deviceIdsToReset.length) {
            req.services.webSocketManager.sendDeviceMessage({
                type: 'animationSetup',
                data: null
            }, deviceIdsToReset[0], ...deviceIdsToReset.slice(1));
        }

        await req.services.animationConfigDb.deleteById(config.id);

        res.status(200).send();
    }
};