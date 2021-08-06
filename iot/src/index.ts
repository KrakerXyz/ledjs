
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import * as os from 'os';

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

    const deviceWs = new DeviceWsClient(
        getRequiredConfig(EnvKey.DeviceId),
        getRequiredConfig(EnvKey.DeviceSecret),
        {
            protocol: 'ws',
            host: remoteAddress
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