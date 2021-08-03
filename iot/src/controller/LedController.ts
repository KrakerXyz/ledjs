import { Animator, DeviceWsClient, Frame } from 'netled';
import { AnimatorProvider } from './AnimatorProvider';
import { Clock } from './Clock';
import rpio from 'rpio';

export class LedController {

    private _animator: Animator | null = null;
    private _buffer: Uint8Array | null = null;
    private _framesDrawn = 0;

    public constructor(readonly deviceWs: DeviceWsClient) {

        rpio.spiBegin();
        rpio.spiSetClockDivider(10); // 250mhz / 100

        new Clock(deviceWs, () => this.tick());

        const animatorProvider = new AnimatorProvider(deviceWs);
        animatorProvider.onAnimation(animator => {
            this._animator = animator;
        });

        let lastNumLeds = 0;
        deviceWs.onDeviceSetup(setup => {
            if (lastNumLeds === setup.numLeds) { return; }
            lastNumLeds = setup.numLeds;
            const startFrameBytes = 4;
            const numEndFrameBytes = Math.ceil(setup.numLeds / 16);
            console.log(`Initializing buffer for ${setup.numLeds} leds`);
            this._buffer = new Uint8Array((setup.numLeds * 4) + startFrameBytes + numEndFrameBytes);
        });

        setInterval(() => {
            const fps = this._framesDrawn / 10;
            this._framesDrawn = 0;
            console.log(`Avg FPS: ${fps}`);
        }, 10_000);

    }

    private tick() {
        if (!this._animator) { return; }
        const frame = this._animator.nextFrame();
        this.rpioDraw(frame);
    }

    private rpioDraw(frame: Frame) {
        if (!this._buffer) { return; }


        for (let i = 0; i < frame.length; i++) {

            const buffPos = (i * 4) + 4; //We add in 4 to account for the leading reset bytes

            const led = frame[i];

            this._buffer[buffPos] = 228; //Brightness
            this._buffer[buffPos + 1] = led[3]; //B
            this._buffer[buffPos + 2] = led[2]; //G
            this._buffer[buffPos + 3] = led[1]; //R

        }

        rpio.spiWrite(Buffer.from(this._buffer), this._buffer.length);
        this._framesDrawn++;
    }

}