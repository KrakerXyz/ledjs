
import { EnvKey, getRequiredConfig } from './services/getRequiredConfig.js';
import { getLogger } from './services/logger.js';
import { restApi } from './services/restApi.js';
import rpio from 'rpio';
import { StrandController } from './services/StrandController.js';
import mqtt from 'mqtt';
import { Id } from '../../core/src/rest/model/Id.js';
import { netledGlobal } from '../../core/src/netledGlobal.js';
import { mqttTopic } from '../../core/src/iot/mqttTopic.js';

(globalThis as any).netled = netledGlobal;

const logger = getLogger('index');
logger.info('Starting up');

const deviceId = atob(getRequiredConfig(EnvKey.LEDJS_AUTH)).split(':')[0] as Id;
logger.info(`Device ID: ${deviceId}`);

logger.debug('Loading device');
const device = await restApi.devices.byId(deviceId);

if(!device) { throw new Error('Device not found'); }

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

const strandController = new StrandController();
if (device.strandId) {
    await strandController.loadStrand(device.strandId);
    if (device.isRunning) {
        logger.info('Device is set to running, starting strand');
        strandController.run();
    }
}

logger.info('Initializing mqtt');
const client = mqtt.connect('mqtt://dev.netled.io', { clientId: `device:${deviceId}` });
client.on('connect', () => {
    logger.info('Connected to mqtt');
    client.subscribe(`netled/device/${deviceId}/#`, (err) => {
        if (err) { throw err; }
        logger.info('Subscribed to device topic');
    });
});

client.on('message', async (topic, message) => {
    logger.info(`Received message on topic ${topic}`);
    if (topic === mqttTopic(`netled/device/${deviceId}/strand-changed`)) {
        const strandId = message.toString() as Id;
        logger.info(`Received new strand id: ${strandId}`);
        await strandController.loadStrand(strandId);
        strandController.run();
    } else if (topic === mqttTopic(`netled/device/${deviceId}/is-running`)) {
        logger.info('Received is-running message');
        const isRunning = message.toString() === 'true';
        if (isRunning) {
            logger.info('Starting strand');
            strandController.run();
        } else {
            logger.info('Pausing strand');
            strandController.pause();
        }
    } else {
        logger.warn(`Unknown topic: ${topic}`);
    }
});

