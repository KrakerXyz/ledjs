
require('dotenv').config();

import * as os from 'os';

import { EnvKey, getConfig, getRequiredConfig, HealthReporter, getLogger, useRestClient, setLoggerDeviceWsClient } from './services';
import { DeviceLogType, DeviceWsClient, type DeviceWsOptions, type RestConfig } from '@krakerxyz/netled-core';
import { LedController } from './controller/LedController';
import * as commandLineArgs from 'command-line-args';
import { readFileSync } from 'fs';

const log = getLogger('index');

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
    log.fatal(`Missing config - ${EnvKey.DeviceId} and/or ${EnvKey.DeviceSecret}. Quitting`);
    process.exit();
}

(async () => {

    const restBaseUrl = getConfig(EnvKey.ApiBaseUrl) as RestConfig['baseUrl'];
    log.info(`Initializing REST client @ ${restBaseUrl ?? '[defaultUrl]'}`);

    useRestClient(restBaseUrl);

    const deviceId = getRequiredConfig(EnvKey.DeviceId);
    const wsBaseUrl = getConfig(EnvKey.WsBaseUrl) as DeviceWsOptions['baseUrl'];

    log.info(`Initializing WS connection for device ${deviceId} @ ${wsBaseUrl ?? '[defaultUrl]'}`);

    const deviceWs = new DeviceWsClient(
        deviceId,
        getRequiredConfig(EnvKey.DeviceSecret),
        {
            baseUrl: wsBaseUrl
        }
    );

    deviceWs.on('connectionChange', state => {

        log.info(`WebSocket ${state}`);

        if (state === 'connected') {
            setLoggerDeviceWsClient(deviceWs);

            log.debug('Reading package.json');
            const packagesJsonContent = readFileSync('package.json');
            const packageJson = JSON.parse(packagesJsonContent.toString());

            log.debug('Sending info message');
            deviceWs.postMessage({
                type: DeviceLogType.Info,
                data: {
                    os: `${os.platform()}|${os.release()}`,
                    cores: os.cpus().length,
                    package: {
                        version: packageJson.version,
                        name: packageJson.name
                    }
                }
            });
        }
    });

    const healthReporter = new HealthReporter(deviceWs);

    healthReporter.addHealthData('cpu', () => os.loadavg() as [number, number, number]);
    healthReporter.addHealthData('uptime', () => Math.floor(process.uptime()));
    healthReporter.addHealthData('uptimeSystem', () => Math.floor(os.uptime()));


    log.info('Initializing leds');

    new LedController(deviceWs, healthReporter);

})();