
import { type IArgb, rgbToHex } from '@krakerxyz/netled-core';
import type { LedArray } from '@/services/animation/LedArray';

export function renderCanvas(context2d: OffscreenCanvasRenderingContext2D, canvasDimensions:[number, number], ledArray: LedArray) {
    context2d.clearRect(0, 0, canvasDimensions[0], canvasDimensions[1]);

    const ledWidth = canvasDimensions[0] / ledArray.length;
    const ledWidthCeil = Math.ceil(ledWidth);

    let offset = 0;
    for (let i = 0; i < ledArray.length; i++) {
        const led: IArgb = ledArray.getLed(i);
        context2d.fillStyle = rgbToHex(led);
        context2d.fillRect(offset, 0, ledWidthCeil, canvasDimensions[1]);
        offset += ledWidth;
    }
}
