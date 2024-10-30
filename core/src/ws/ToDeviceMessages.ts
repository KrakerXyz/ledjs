import type { AnimationConfig } from '../rest/model/AnimationConfig.js';


export type ToDeviceMessage = AnimationSetupMessage | DeviceSetupMessage | AnimationStopMessage;

export interface AnimationSetupMessage {
    type: 'animationSetup',
    /** The animation and configuration to load on device or null to clear current animation */
    data: AnimationConfig | null,
}

export interface DeviceSetupMessage {
    type: 'deviceSetup',
    data: DeviceSetupData,
}

export interface DeviceSetupData {
    /** Number of LEDs connected to the SPI interface */
    numLeds: number,
    /** Speed in MHz to run the SPI interface at */
    spiSpeed: number,
}

export interface AnimationStopMessage {
    type: 'animationStop',
    data: AnimationStopData,
}

export interface AnimationStopData {
    stop: boolean,
}