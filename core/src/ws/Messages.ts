import { Config } from '..';

export type WsMessage = LedSetupMessage;

export type LedSetupMessage = {
    type: 'ledSetup',
    data: WsLedsSetup
}

export interface WsLedsSetup {
    animation: WsLedsSetupAnimation;
    numLeds: number;
    interval: number;
}

export interface WsLedsSetupAnimation {
    id: string;
    version: number;
    config?: Config<any>;
}
