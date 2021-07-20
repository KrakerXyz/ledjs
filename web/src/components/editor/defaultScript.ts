
export function useDefaultScript(): string {
    return [
        '"use strict";',
        '',
        'export class MyLedAnimation {',
        '',
        '  static meta = {',
        '     params: [',
        '     ]',
        '  }',
        '',
        '  constructor() {',
        '     this.#frame = [];',
        '  }',
        '',
        '  setNumLeds(numLeds) {',
        '     this.#frame = [];',
        '     for(let i = 0; i < numLeds; i++) {',
        '        this.#frame.push([0, 0, 0]);',
        '     }',
        '  }',
        '',
        '  setConfig(config) {',
        '  }',
        '',
        '  nextFrame() {',
        '     return this.#frame;',
        '  }',
        '',
        '}',
        ''
    ].join('\r\n');
}