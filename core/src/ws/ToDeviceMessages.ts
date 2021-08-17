import { AnimationConfig } from '../rest';



export type ToDeviceMessage = AnimationSetupMessage | DeviceSetupMessage | AnimationStopMessage;

export type AnimationSetupMessage = {
    type: 'animationSetup',
    /** The animation and configuration to load on device or null to clear current animation */
    data: AnimationConfig | null
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