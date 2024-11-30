
import { EnvKey, getRequiredConfig } from './services/getRequiredConfig.js';
import { getLogger } from './services/logger.js';
import { restApi } from './services/restApi.js';
import rpio from 'rpio';
import { StrandController } from './services/StrandController.js';
import mqtt from 'mqtt';
import { Id } from '../../core/src/rest/model/Id.js';
import { netledGlobal } from '../../core/src/netledGlobal.js';
import { mqttTopic, NetledPrefix } from '../../core/src/iot/mqttTopic.js';
import { deepClone } from '../../core/src/services/deepClone.js';
import * as os from 'os';

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

const strandController = new StrandController();
if (device.strandId) {
    await strandController.loadStrand(device.strandId);
    if (device.isRunning) {
        logger.info('Device is set to running, starting strand');
        strandController.run();
    }
}

const clientId = `netled${services.mqtt.env}-device:${deviceId}`;
const mqttPrefix = `netled${services.mqtt.env}` as NetledPrefix;

logger.info(`Connecting to mqtt ${services.mqtt.username}@${services.mqtt.url}`);

const client = mqtt.connect(services.mqtt.url, {
    clientId ,
    username: services.mqtt.username,
    password: services.mqtt.password,
    rejectUnauthorized: false,
    protocolVersion: 5
});

client.on('error', (err) => {
    logger.error(`Error connecting to mqtt: ${err}`);
});

let statusInterval: NodeJS.Timeout | null = null;
client.on('connect', async () => {
    logger.info('Connected to mqtt');
    await client.subscribeAsync(`${mqttPrefix}/device/${deviceId}/#`, { qos: 1 });

    if (device.strandId) {
        await client.subscribeAsync(mqttTopic(`${mqttPrefix}/strand/${device.strandId}/updated`), { qos: 1 });
    }

    statusInterval ??= setInterval(() => {
        const status = {
            isRunning: device.isRunning,
            systemCpu: os.loadavg(),
            systemUpTime: Math.floor(os.uptime()),
            processUpTime: Math.floor(process.uptime()),
        }
        client.publish(
            mqttTopic(`${mqttPrefix}/status/${deviceId}`),
            JSON.stringify(status),
            {
                retain: true,
                properties: {
                    messageExpiryInterval: 17   
                }
            },
            (err) => {
                if (err) {
                    logger.error(`Error publishing device status: ${err}`);
                }
            });
    }, 15000);
});

client.on('message', async (topic, message) => {
    logger.info(`Received message on topic ${topic}`);
    if (topic === mqttTopic(`${mqttPrefix}/device/${deviceId}/strand-changed`)) {
        const strandId = message.toString() as Id;

        if (device.strandId) {
            client.unsubscribeAsync(mqttTopic(`${mqttPrefix}/strand/${device.strandId}/updated`));
        }

        if (strandId && strandId !== device.strandId) {
            await client.subscribeAsync(mqttTopic(`${mqttPrefix}/strand/${strandId}/updated`), { qos: 1 });
        }

        device.strandId = strandId;
        await strandController.loadStrand(strandId);
        strandController.run();
    } else if (topic === mqttTopic(`${mqttPrefix}/device/${deviceId}/is-running`)) {
        const isRunning = message.toString() === 'true';
        device.isRunning = isRunning;
        if (isRunning) {
            logger.info('Starting strand');

            strandController.run();
        } else {
            logger.info('Pausing strand');
            strandController.pause();
        }
    } else if (topic === mqttTopic(`${mqttPrefix}/strand/${device.strandId!}/updated`)) {
        logger.info('Strand updated');
        await strandController.loadStrand(device.strandId!);
        if (device.isRunning) {
            logger.info('Restarting strand');
            strandController.run();
        }
    } else {
        logger.warn(`Unknown topic: ${topic}`);
    }
});

