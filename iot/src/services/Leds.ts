import { Animation } from 'src/animations';
import { Frame } from 'src/color-utilities';
import rpio from 'rpio';
import { useAnimation } from './animationService';
import { deepEquals } from './deepEquals';

export class Leds {

    public constructor() {
        rpio.spiBegin();
        rpio.spiSetClockDivider(100);
    }

    private _animation: Animation<any> | undefined;

    private _lastSetup: LedsSetup | null = null;
    public setup(setup: LedsSetup) {

        if (setup.animationName !== this._lastSetup?.animationName) {
            this._animation = useAnimation(setup.animationName);
            this._animation.setNumLeds(setup.numLeds);
            if (setup.animationConfig) { this._animation.setConfig(setup.animationConfig); }
        } else {

            if (setup.numLeds !== this._lastSetup?.numLeds) {
                this._animation?.setNumLeds(setup.numLeds);
            }

            if (setup.animationConfig && !deepEquals(setup.animationConfig, this._lastSetup?.animationConfig)) {
                this._animation?.setConfig(setup.animationConfig);
            }

        }

        if (setup.interval !== this._lastSetup?.interval) {
            this.setInterval(setup.interval);
        }

        this._lastSetup = setup;

    }

    private _intervalTimeout: NodeJS.Timeout | undefined;
    private setInterval(interval: number) {
        if (this._intervalTimeout) { clearInterval(this._intervalTimeout); }
        this._intervalTimeout = setInterval(() => {
            const frame = this._animation?.nextFrame();
            if (!frame) { return; }
            this.rpioDraw(frame);

        }, interval);
    }

    private rpioDraw(frame: Frame) {

        const buffer = Buffer.alloc((frame.length * 4) + 4, '00000000', 'hex');

        for (let i = 0; i < frame.length; i++) {

            const buffPos = (i * 4) + 4; //We add in 4 to account for the leading reset bytes

            buffer[buffPos] = 224 + 4; //Brightness
            buffer[buffPos + 1] = frame[i][2]; //B
            buffer[buffPos + 2] = frame[i][1]; //G
            buffer[buffPos + 3] = frame[i][0]; //R

        }

        rpio.spiWrite(buffer, buffer.length);

    }

}

export interface LedsSetup {
    animationName: string;
    animationConfig?: Record<string, any>;
    numLeds: number;
    interval: number;
}