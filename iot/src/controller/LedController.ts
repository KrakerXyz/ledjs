import { Animator, ARGB, DeviceWsClient, Frame } from 'netled';
import { AnimatorProvider } from './AnimatorProvider';
import { Clock } from './Clock';
import rpio from 'rpio';

export class LedController {

    static readonly REPORT_INTERVAL = 15_000;

    private _animator: Animator | null = null;
    private _buffer: Buffer | null = null;
    private _framesDrawn = 0;

    public constructor(readonly deviceWs: DeviceWsClient) {

        this.initSpi(25);

        new Clock(deviceWs, () => this.tick());

        const animatorProvider = new AnimatorProvider(deviceWs);
        animatorProvider.onAnimation(animator => {
            this._animator = animator;
        });

        let lastNumLeds = 0;
        deviceWs.onDeviceSetup(setup => {
            if (lastNumLeds !== setup.numLeds) {
                lastNumLeds = setup.numLeds;
                const startFrameBytes = 4;
                const numEndFrameBytes = Math.max(4, Math.ceil(setup.numLeds / 16));
                console.log(`Initalizing buffer for ${setup.numLeds} leds`);
                this._buffer = Buffer.alloc((setup.numLeds * 4) + startFrameBytes + numEndFrameBytes);
            }

            this.initSpi(setup.spiSpeed);
        });

        let reportInterval: NodeJS.Timeout | null = setInterval(() => {
            this.report();
        }, LedController.REPORT_INTERVAL);

        deviceWs.onAnimationStop(data => {
            if (data.stop) {
                if (reportInterval) {
                    console.debug('Stopping report interval');
                    clearInterval(reportInterval);
                    reportInterval = null;
                }

                if (lastNumLeds) {
                    console.log('Drawing dark frame to clear leds');
                    const darkLeds: ARGB = [255, 0, 0, 0];
                    const darkFrame: Frame = [];
                    for (let i = 0; i < lastNumLeds; i++) {
                        darkFrame.push(darkLeds);
                    }
                    this.rpioDraw(darkFrame);
                }

            } else if (!reportInterval) {
                console.debug('Starting report interval');
                reportInterval = setInterval(() => {
                    this.report();
                }, LedController.REPORT_INTERVAL);
            }
        });

    }

    private _spiBegun = false;
    private _lastSpiSpeed: number | null = null;
    private initSpi(mhz: number) {
        if (mhz === this._lastSpiSpeed) { return; }
        this._lastSpiSpeed = mhz;

        const divisor = 250 / mhz;
        const divider = divisor - (divisor % 2);

        console.log(`Initializing SPI to ~${mhz}mhz using divider ${divider}`);
        if (this._spiBegun) { rpio.spiEnd(); }
        rpio.spiBegin();
        rpio.spiSetClockDivider(divider);
        this._spiBegun = true;
    }

    private report() {
        const fps = this._framesDrawn / LedController.REPORT_INTERVAL / 1000;
        this._framesDrawn = 0;
        console.log(`Avg FPS: ${fps}`);
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

        rpio.spiWrite(this._buffer, this._buffer.length);
        this._framesDrawn++;
    }

}