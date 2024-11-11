
import { rgbToHex } from '$core/color-utilities/rgbToHex';
import type { IArgb } from '$core/IArgb';
import { computed, type Ref } from 'vue';
import type { LedSegment, LedSegmentCallback } from './LedSegment';


export function useCanvasRenderer(canvasContainer: Readonly<Ref<HTMLDivElement | undefined | null>>): LedSegmentCallback {
    let canvas: HTMLCanvasElement | undefined = undefined;

    const canvas2d = computed(() => {
        canvas?.remove();
        if (!canvasContainer.value) {
            return undefined;
        }
        canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvasContainer.value.appendChild(canvas);

        return canvas.getContext('2d');
    });

    const emptyProm = Promise.resolve();
    return (ledSegment: LedSegment) => {
        if (!canvas2d.value || !canvas) {
            return emptyProm;
        }

        const canvasDimensions: [number, number] = [canvas.width, canvas.height];
        renderCanvas(canvas2d.value, canvasDimensions, ledSegment);
        return emptyProm;

    };
}


export function renderCanvas(context2d: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D, canvasDimensions:[number, number], ledSegment: LedSegment) {
    context2d.clearRect(0, 0, canvasDimensions[0], canvasDimensions[1]);

    const ledWidth = canvasDimensions[0] / ledSegment.length;
    const ledWidthCeil = Math.ceil(ledWidth);

    let offset = 0;
    for (let i = 0; i < ledSegment.length; i++) {
        const led: IArgb = ledSegment.getLed(i);
        context2d.fillStyle = rgbToHex(led);
        context2d.fillRect(offset, 0, ledWidthCeil, canvasDimensions[1]);
        offset += ledWidth;
    }
}
