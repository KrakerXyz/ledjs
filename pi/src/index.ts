import { EnvKey, getRequiredConfig } from './services/getRequiredConfig.js';
import { getLogger } from './services/logger.js';
import { restApi } from './services/restApi.js';

const logger = getLogger('index');
logger.info('Starting up');

const deviceId = atob(getRequiredConfig(EnvKey.LEDJS_AUTH)).split(':')[0];
logger.info(`Device ID: ${deviceId}`);

logger.info('Loading device');
const device = await restApi.devices.byId(deviceId);

if(!device) { throw new Error('Device not found'); }

logger.info(`Got device '${device.name}'`);