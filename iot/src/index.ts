
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import * as os from 'os';

import { EnvKey, getConfig, getRequiredConfig, HealthReporter, useRestClient } from './services';
import { DeviceWsClient, DeviceWsOptions, RestConfig } from 'netled';
import { LedController } from './controller/LedController';

if (!getConfig(EnvKey.DeviceId) || !getConfig(EnvKey.DeviceSecret)) {
    console.error('Missing config - deviceId/secret. Quitting');
    process.exit();
}

(async () => {

    const restBaseUrl = getConfig(EnvKey.ApiBaseUrl) as RestConfig['baseUrl'];
    console.log(`Initializing REST client @ ${restBaseUrl ?? '[defaultUrl]'}`);

    useRestClient(restBaseUrl);

    const deviceId = getRequiredConfig(EnvKey.DeviceId);
    const wsBaseUrl = getConfig(EnvKey.WsBaseUrl) as DeviceWsOptions['baseUrl'];

    console.log(`Initializing WS connection for device ${deviceId} @ ${wsBaseUrl ?? '[defaultUrl]'}`);

    const deviceWs = new DeviceWsClient(
        deviceId,
        getRequiredConfig(EnvKey.DeviceSecret),
        {
            baseUrl: wsBaseUrl
        }
    );

    deviceWs.on('connectionChange', state => {
        console.log(`WebSocket ${state}`);

        if (state === 'connected') {
            deviceWs.postMessage({
                type: 'info',
                data: {
                    os: `${os.platform()}|${os.release()}`,
                    cores: os.cpus().length
                }
            });
        }
    });

    const healthReporter = new HealthReporter(deviceWs);

    healthReporter.addHealthData('cpu', () => os.loadavg() as [number, number, number]);
    healthReporter.addHealthData('uptime', () => Math.floor(process.uptime()));
    healthReporter.addHealthData('uptimeSystem', () => Math.floor(os.uptime()));


    console.log('Initializing leds');

    new LedController(deviceWs, healthReporter);

})();