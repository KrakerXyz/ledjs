import { RouteOptions } from 'fastify-websocket';
import { DeviceLedsSetupPost } from 'netled';
import { jwtAuthentication } from '../../services';
import { DeviceDb } from '../../db/DeviceDb';

export const postLedsSetup: RouteOptions = {
    method: 'POST',
    url: '/api/devices/leds-setup',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {

        const db = new DeviceDb();

        const deviceSetup = req.body as DeviceLedsSetupPost;

        const devices = await Promise.all(deviceSetup.deviceIds.map(did => db.byId(did)));

        if (devices.some(d => !d)) {
            res.status(400).send('One or more devices did not exist');
            return;
        }

        if (devices.some(d => d?.userId !== req.user.sub)) {
            res.status(403).send('User does not have access to one or more devices');
            return;
        }

        const updateProms: Promise<any>[] = [];
        for (const d of devices) {
            if (!d) { continue; }
            d.status.animation = deviceSetup.animation;
            updateProms.push(db.replace(d));
        }

        req.services.webSocketManager.sendDeviceMessage({
            type: 'animationSetup',
            data: deviceSetup.animation
        }, ...deviceSetup.deviceIds);

        res.send();

    }
};