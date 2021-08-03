
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { EnvKey, getConfig, getRequiredConfig, useRestClient } from './services';
import { DeviceWsClient } from 'netled';
import { LedController } from './controller/LedController';

if (!getConfig(EnvKey.DeviceId) || !getConfig(EnvKey.DeviceSecret)) {
    console.error('Missing config - deviceId/secret. Quitting');
    process.exit();
}

(async () => {

    const remoteAddress = getConfig(EnvKey.WsHost, 'localhost:3001');

    useRestClient(remoteAddress);

    const deviceWs = new DeviceWsClient(remoteAddress, getRequiredConfig(EnvKey.DeviceId), getRequiredConfig(EnvKey.DeviceSecret));

    console.log('Initializing leds');

    new LedController(deviceWs);

    //const leds = new Leds();

    // deviceWs.onDeviceSetup(setup => {
    //     leds.setupDevice(setup);
    // });

    // deviceWs.onAnimationSetup(setup => {
    //     leds.setupAnimation(setup);
    // });

    // deviceWs.onAnimationStop(stop => {
    //     leds.stopAnimation(stop.stop);
    // });

})();