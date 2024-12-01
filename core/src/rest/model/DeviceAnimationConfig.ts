import type { Id } from './Id.js';

export interface DeviceAnimationConfigPost {
    deviceIds: [Id, ...Id[]],
    /** The id of an animation config to store on the device. Pass null to clear any existing config and use default value */
    configId: Id | null,
}