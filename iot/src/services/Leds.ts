
import rpio from 'rpio';
import { deepEquals } from './deepEquals';
import { Animator, ARGB, DeviceAnimationSetup, DeviceSetupData, Frame } from 'netled';
import { useAnimation } from '.';

export class Leds {

    public constructor() {
        rpio.spiBegin();
        rpio.spiSetClockDivider(22); // 250mhz / 100
    }

    private _animation: Animator | null = null;
    private _lastSetup: DeviceAnimationSetup | null = null;
    private _lastDeviceSetup: DeviceSetupData | null = null;

    public async setupAnimation(setup: DeviceAnimationSetup): Promise<void> {

        if (setup.id !== this._lastSetup?.id || setup.version !== this._lastSetup?.version) {
            console.log(`Loading animation ${setup.id}:${setup.version}`);
            this._animation = await useAnimation(setup.id, setup.version);

            if (!this._animation) {
                console.error('Animation did not exist');
                return;
            }

            this._animation.setNumLeds(this._lastDeviceSetup?.numLeds ?? 0);

            if (setup.config) {
                if (this._animation.setConfig) {
                    this._animation.setConfig(setup.config);
                } else {
                    console.warn('Got a config for an animator that has no setConfig method. Ignoring.');
                }
            }

        } else {

            if (this._animation && setup.config && !deepEquals(setup.config, this._lastSetup?.config)) {
                if (this._animation.setConfig) {
                    console.log('Updating animator config');
                    this._animation.setConfig(setup.config);
                } else {
                    console.warn('Got a config for an animator that has no setConfig method. Ignoring.');
                }
            }

        }

        this.setInterval(setup.interval);

        this._lastSetup = setup;

    }

    public async setupDevice(setup: DeviceSetupData) {
        if (deepEquals(setup, this._lastDeviceSetup)) { return; }
        console.log(`Updating animator numLeds to ${setup.numLeds}`);
        this._animation?.setNumLeds(setup.numLeds);
        this._lastDeviceSetup = setup;
    }

    private _intervalTimeout: NodeJS.Timeout | null = null;
    private _lastInterval = -1;
    private _isNextFrameError = false;
    private setInterval(interval: number) {
        if (this._intervalTimeout && interval === this._lastInterval) { return; }
        this._lastInterval = interval;

        if (this._intervalTimeout) { clearInterval(this._intervalTimeout); }
        if (this._isStopped) {
            console.log('Holding interval change because animation is stopped');
            return;
        }
        console.log(`Set draw interval to ${interval}ms`);
        this._intervalTimeout = setInterval(() => {
            let position: string = 'nextFrame';
            try {
                const frame = this._animation?.nextFrame();
                if (!frame) { return; }
                position = 'draw';
                this.rpioDraw(frame);
                this._isNextFrameError = false;
            } catch (e) {
                if (this._isNextFrameError) { return; }
                console.error(`Error during interval tick on ${position}: ${e.message}`);
                this._isNextFrameError = true;
            }
        }, interval);
    }

    private _isStopped: boolean = false;
    public stopAnimation(stop: boolean) {
        if (stop) {
            this._isStopped = true;
            if (!this._intervalTimeout) { return; }
            clearInterval(this._intervalTimeout);
            console.log('Stopping animation');
            this._intervalTimeout = null;
            const frame: Frame = [];
            const darkLed: ARGB = [0, 0, 0, 0];
            //I used to check for < 1 but it was leaving one pixel at the end lit.
            //I tried adding an extra 4 bytes of 255 to the end in rpioDraw but it didn't do anything.
            for (let i = 0; i <= (this._lastDeviceSetup?.numLeds ?? 0); i++) {
                frame.push(darkLed);
            }
            this.rpioDraw(frame);
        } else {
            this._isStopped = false;
            if (this._intervalTimeout) { return; }
            if (this._lastInterval === -1) { return; }
            console.log('Starting animation');
            this.setInterval(this._lastInterval);
        }
    }

    private _buffer: Buffer | null = null;
    private rpioDraw(frame: Frame) {

        if (!this._buffer || this._buffer.length !== (frame.length * 4) + 8) {
            console.log(`Initializing buffer for frame length ${frame.length}`);
            this._buffer = Buffer.alloc((frame.length * 4) + 8, '00000000', 'hex');
            this._buffer[frame.length - 1] = 255;
            this._buffer[frame.length - 2] = 255;
            this._buffer[frame.length - 3] = 255;
            this._buffer[frame.length - 4] = 255;
        }

        for (let i = 0; i < frame.length; i++) {

            const buffPos = (i * 4) + 4; //We add in 4 to account for the leading reset bytes

            this._buffer[buffPos] = 224 + 4; //Brightness
            this._buffer[buffPos + 1] = frame[i][3]; //B
            this._buffer[buffPos + 2] = frame[i][2]; //G
            this._buffer[buffPos + 3] = frame[i][1]; //R

        }

        rpio.spiWrite(this._buffer, this._buffer.length);

    }

}