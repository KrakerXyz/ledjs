
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { EnvKey, getConfig, getRequiredConfig, Leds, useRestClient } from './services';
import { DeviceWsClient } from 'netled';

if (!getConfig(EnvKey.DeviceId) || !getConfig(EnvKey.DeviceSecret)) {
    console.error('Missing config - deviceId/secret. Quitting');
    process.exit();
}

(async () => {

    const remoteAddress = getConfig(EnvKey.WsHost, 'localhost:3001');

    useRestClient(remoteAddress);

    console.log('Initializing leds');
    const leds = new Leds();

    const deviceWs = new DeviceWsClient(remoteAddress, getRequiredConfig(EnvKey.DeviceId), getRequiredConfig(EnvKey.DeviceSecret));

    deviceWs.onDeviceSetup(setup => {
        leds.setupDevice(setup);
    });

    deviceWs.onAnimationSetup(setup => {
        leds.setupAnimation(setup);
    });

    deviceWs.onAnimationStop(stop => {
        leds.stopAnimation(stop.stop);
    });

})();