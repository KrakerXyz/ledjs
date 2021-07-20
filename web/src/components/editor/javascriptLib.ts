import { EditorConfig } from './monacoEditor';

export function useJavascriptLib(): EditorConfig['javascriptLib'] {
    return {
        'netled': [
            'declare const netled: {',
            '',
            '  util: {',
            '',
            '     color: {',
            '',
            '        /**', ,
            '        * Converts HSL values to a [R, G, B] value',
            '        * @param h - Hue as a number between 0-360',
            '        * @param s - Saturation as a number between 0-100',
            '        * @param l - Luminance as a number between 0-100',
            '        */',
            '        hslToRgb(h: number, s: number, l: number): [number, number, number]',
            '',
            '        /**',
            '        * Convert RGB byte array to hex code',
            '        * @param rgb - RGB values',
            '        */',
            '        rbgToHed(rgb: [number, number, number]): string',
            '',
            '     }', //color
            '',
            '     frame: {',
            '',
            '        /**',
            '        * Rotate leds by shifting all leds by one',
            '        * @param frame - Array of RGB values to shift',
            '        * @param dir - Direction in which to shift. -1 Default): clockwise | 1) counter-clockwise',
            '        */',
            '        rotateFrame(frame: [number, number, number][], dir: -1 | 1 = -1): void',
            '',
            '     }', //frame
            '',
            '  }',
            '',
            '}'
        ].join('\r\n')
    }
}