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
            '        /**',
            '        * Converts HSL values to a [A, R, G, B] value. The alpha for the returned array is hardcoded to 255',
            '        * @param h Hue as a number between 0-360',
            '        * @param s Saturation as a number between 0-100',
            '        * @param l Luminance as a number between 0-100',
            '        */',
            '        hslToRgb(h: number, s: number, l: number): [number, number, number, number]',
            '',
            '        /**',
            '        * Convert ARGB byte array to hex code. Alpha channel is ignored',
            '        * @param argb ARGB values',
            '        */',
            '        rbgToHex(argb: [number, number, number, number]): string',
            '',
            '        /**',
            '        * Proportionally lighten or darken all values by the given decimal',
            '        * @param argb ARGB values',
            '        * @param shade A decimal that will be multiplied by the current value and then added to each RGB value. Resulting values to be added are rounded and then capped to 255',
            '        */',
            '        shade(argb: [number, number, number, number], decimal: number): void',
            '',
            '     }', //color
            '',
            '     frame: {',
            '',
            '        /**',
            '        * Rotate leds by shifting all leds by one',
            '        * @param frame Array of ARGB values to shift',
            '        * @param dir Direction in which to shift. -1 Default): clockwise | 1) counter-clockwise',
            '        */',
            '        rotateFrame(frame: [number, number, number, number][], dir: -1 | 1 = -1): void',
            '',
            '     }', //frame
            '',
            '  }',
            '',
            '}'
        ].join('\r\n')
    };
}