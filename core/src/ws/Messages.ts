
import { DeviceAnimationSetup } from '../rest';

export type ToDeviceMessage = AnimationSetup | DeviceSetup | AnimationStop;

export type AnimationSetup = {
    type: 'animationSetup',
    data: DeviceAnimationSetup
}

export type DeviceSetup = {
    type: 'deviceSetup',
    data: DeviceSetupData
}

export type DeviceSetupData = {
    numLeds: number;
}

export type AnimationStop = {
    type: 'animationStop'
    data: AnimationStopData
}

export type AnimationStopData = {
    stop: boolean;
}

