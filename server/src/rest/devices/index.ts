import { deleteById } from './deleteById.js';
import { getDevice } from './getDevice.js';
import { getDevices } from './getDevices.js';
import { postDevice } from './postDevice.js';
import { setStrand } from './setStrand.js';
import { setRunning } from './setRunning.js';


export const deviceRoutes = [getDevices, postDevice, getDevice, deleteById, setStrand, setRunning];