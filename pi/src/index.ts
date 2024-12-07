
import { EnvKey, getRequiredConfig } from './services/getRequiredConfig.js';
import { getLogger } from './services/logger.js';
import { restApi } from './services/restApi.js';
import rpio from 'rpio';
import { StrandController } from './services/StrandController.js';
import { Id } from '../../core/src/rest/model/Id.js';
import { netledGlobal } from '../../core/src/netledGlobal.js';
import { deepClone } from '../../core/src/services/deepClone.js';
import * as os from 'os';
import { Mqtt } from './services/Mqtt.js';

(globalThis as any).netled = netledGlobal;

const logger = getLogger('index');
logger.info('Starting up.');
if (process.argv.length > 2) {
    logger.info(`Parsing command line arguments: ${process.argv.slice(2).join(' ')}`);
    const hostIndex = process.argv.indexOf('--host');
    if (hostIndex >= 0) {
        process.env[EnvKey.LEDJS_HOST] = process.argv[hostIndex + 1];
    }

    const authIndex = process.argv.indexOf('--auth');
    if (authIndex >= 0) {
        process.env[EnvKey.LEDJS_AUTH] = process.argv[authIndex + 1];
    }
}

logger.debug('Loading services');
const services = await restApi.iot.services();
logger.info('Service descriptors loaded');

const deviceId = atob(getRequiredConfig(EnvKey.LEDJS_AUTH)).split(':')[0] as Id;

logger.debug(`Loading device ${deviceId}`);
const device = deepClone(await restApi.devices.byId(deviceId));

if (!device) { throw new Error('Device not found'); }

logger.info(`Got device '${device.name}'`);

const divisor = 250 / device.spiSpeed;
const divider = divisor - (divisor % 2);

logger.info(`Initializing SPI to ~${device.spiSpeed}mhz using divider ${divider}`);
rpio.spiBegin();
rpio.spiSetClockDivider(divider);

//Draw an arbitrarily huge number of dark leds to clear string on startup
logger.info('Clearing leds');
(() => {
    const darkBuffer = Buffer.alloc(4 * 1000, 0);
    rpio.spiWrite(darkBuffer, darkBuffer.length);
})();

const clientId = `${services.mqtt.prefix}-device:${deviceId}`;
const mqttPrefix = services.mqtt.prefix;

logger.info(`Connecting to mqtt ${services.mqtt.username}@${services.mqtt.url}`);
const mqtt = await Mqtt.connect(services.mqtt.url, services.mqtt.username, services.mqtt.password, clientId, mqttPrefix);

logger.info('Mqtt connected. Starting device status update interval');
setInterval(() => {
    const status = {
        isRunning: device.isRunning,
        systemCpu: os.loadavg(),
        systemUpTime: Math.floor(os.uptime()),
        processUpTime: Math.floor(process.uptime()),
    }

    mqtt.publish(`status/${deviceId}`,
        JSON.stringify(status),
        {
            retain: true,
            properties: {
                messageExpiryInterval: 17
            }
        });
}, 15000);

await mqtt.subscribeAsync(`device/${deviceId}/strand-changed`, async (message) => {
    const strandId = message as Id;
    device.strandId = strandId;
    await strandController.loadStrandAsync(strandId);
    strandController.run();
}, { qos: 1 });

await mqtt.subscribeAsync(`device/${deviceId}/is-running`, async (message) => {
    const isRunning = message === 'true';
    device.isRunning = isRunning;
    if (isRunning) {
        logger.info('Starting strand');
        strandController.run();
    } else {
        logger.info('Pausing strand');
        strandController.pause();
    }
}, { qos: 1 });

const strandController = new StrandController(mqtt);
if (device.strandId) {
    await strandController.loadStrandAsync(device.strandId);
    if (device.isRunning) {
        logger.info('Device is set to running, starting strand');
        strandController.run();
    }
}
