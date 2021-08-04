
import { DeviceAnimationSetup } from '../rest';

export type ToDeviceMessage = AnimationSetupMessage | DeviceSetupMessage | AnimationStopMessage;

export type AnimationSetupMessage = {
    type: 'animationSetup',
    data: DeviceAnimationSetup
}

export type DeviceSetupMessage = {
    type: 'deviceSetup',
    data: DeviceSetupData
}

export type DeviceSetupData = {
    /** Number of LEDs connected to the SPI interface */
    numLeds: number;
    /** Speed in MHz to run the SPI interface at */
    spiSpeed: number;
}

export type AnimationStopMessage = {
    type: 'animationStop'
    data: AnimationStopData
}

export type AnimationStopData = {
    stop: boolean;
}

