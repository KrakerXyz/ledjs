
import { getDevice } from './getDevice';
import { getDevices } from './getDevices';
import { postDevice } from './postDevice';
import { postLedsSetup } from './postLedSetup';

export const deviceRoutes = [getDevices, postDevice, getDevice, postLedsSetup];