import { DeviceLedsSetup } from '..';

export type ToDeviceMessage = LedSetupMessage;

export type LedSetupMessage = {
    type: 'ledSetup',
    data: DeviceLedsSetup
}