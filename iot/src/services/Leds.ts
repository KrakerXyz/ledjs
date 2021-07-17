import { Animation } from 'src/animations';
import { Frame } from 'src/color-utilities';
import rpio from 'rpio';

export class Leds {

    public constructor() {
        console.log('Initializing SPI');
        rpio.spiBegin();
        rpio.spiSetClockDivider(100);
    }

    private _animation: Animation<any> | undefined;

    public setAnimation(animation: Animation<any>) {
        this._animation = animation;
    }

    private _intervalTimeout: NodeJS.Timeout | undefined;
    public setInterval(interval: number) {
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