
import { getDevice } from './getDevice';
import { getDevices } from './getDevices';
import { postDevice } from './postDevice';
import { postAnimation } from './postAnimation';
import { postStop } from './postStop';
import { postAnimationConfig } from './postAnimationConfig';

export const deviceRoutes = [getDevices, postDevice, getDevice, postAnimation, postStop, postAnimationConfig];