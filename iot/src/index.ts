
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import * as os from 'os';

import { EnvKey, getConfig, getRequiredConfig, HealthReporter, useRestClient } from './services';
import { DeviceWsClient, DeviceWsOptions, RestConfig } from '@krakerxyz/netled-core';
import { LedController } from './controller/LedController';
import * as commandLineArgs from 'command-line-args';

if (process.argv.length > 2) {
    const argsDefinition: commandLineArgs.OptionDefinition[] = [
        { name: EnvKey.DeviceId, alias: 'i', type: String },
        { name: EnvKey.DeviceSecret, alias: 's', type: String },
        { name: EnvKey.ApiBaseUrl, alias: 'a', type: String },
        { name: EnvKey.WsBaseUrl, alias: 'w', type: String }
    ];

    const options = commandLineArgs.default(argsDefinition);

    for (const key of Object.getOwnPropertyNames(options)) {
        const value = options[key];
        if (!value) { continue; }
        process.env[key] = value;
    }

}

if (!getConfig(EnvKey.DeviceId) || !getConfig(EnvKey.DeviceSecret)) {
    console.error(`Missing config - ${EnvKey.DeviceId} and/or ${EnvKey.DeviceSecret}. Quitting`);
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