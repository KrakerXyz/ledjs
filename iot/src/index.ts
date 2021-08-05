
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { loadavg } from 'os';

import { EnvKey, getConfig, getRequiredConfig, HealthReporter, useRestClient } from './services';
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

    const healthReporter = new HealthReporter(deviceWs);

    healthReporter.addHealthData('cpu', () => {
        return loadavg() as [number, number, number];
    });

    console.log('Initializing leds');

    new LedController(deviceWs, healthReporter);

})();