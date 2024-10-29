import { deleteById } from './deleteById.js';
import { getDevice } from './getDevice.js';
import { getDevices } from './getDevices.js';
import { postAnimation } from './postAnimation.js';
import { postAnimationConfig } from './postAnimationConfig.js';
import { postAnimationReset } from './postAnimationReset.js';
import { postDevice } from './postDevice.js';
import { postDeviceLogsList } from './postDeviceLogsList.js';
import { postStop } from './postStop.js';


export const deviceRoutes = [getDevices, postDevice, getDevice, postAnimation, postStop, postAnimationConfig, postAnimationReset, deleteById, postDeviceLogsList];