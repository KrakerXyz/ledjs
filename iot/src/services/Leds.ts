
import rpio from 'rpio';
import { deepEquals } from './deepEquals';
import { Animator, Frame, WsLedsSetup } from 'netled';
import { useAnimation } from '.';

export class Leds {

    public constructor() {
        rpio.spiBegin();
        rpio.spiSetClockDivider(100);
    }

    private _animation: Animator<any> | undefined;

    private _lastSetup: WsLedsSetup | null = null;
    public async setup(setup: WsLedsSetup): Promise<void> {

        if (setup.animation.id !== this._lastSetup?.animation.id && setup.animation.version !== this._lastSetup?.animation.version) {

            this._animation = await useAnimation(setup.animation.id, setup.animation.version);
            this._animation.setNumLeds(setup.numLeds);
            if (setup.animation.config) {
                if (this._animation.setConfig) {
                    this._animation.setConfig(setup.animation.config);
                } else {
                    console.warn('Got a config for an animator that has no setConfig method. Ignoring.');
                }
            }

        } else {

            if (setup.numLeds !== this._lastSetup?.numLeds) {
                this._animation?.setNumLeds(setup.numLeds);
            }

            if (this._animation && setup.animation.config && !deepEquals(setup.animation.config, this._lastSetup?.animation.config)) {
                if (this._animation.setConfig) {
                    this._animation.setConfig(setup.animation.config);
                } else {
                    console.warn('Got a config for an animator that has no setConfig method. Ignoring.');
                }
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
            buffer[buffPos + 1] = frame[i][3]; //B
            buffer[buffPos + 2] = frame[i][2]; //G
            buffer[buffPos + 3] = frame[i][1]; //R

        }

        rpio.spiWrite(buffer, buffer.length);

    }

}