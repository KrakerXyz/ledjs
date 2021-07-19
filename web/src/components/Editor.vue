
<template>
   <div id="editor-ide-container" class="h-100 border"></div>
</template>

<script lang="ts">

   import { defineComponent, onMounted } from 'vue';
   import type * as monaco from 'monaco-editor';

   export default defineComponent({
      props: {
      },
      setup() {

         const tmpScript = localStorage.getItem('tmp-script') ?? [
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

         onMounted(() => {

            const utilities = [
               'declare const utilities: {',
               '  color: {',
               '     /**', ,
               '      * Converts HSL values to a [R, G, B] value',
               '        @param h - Hue as a number between 0-360',
               '        @param s - Saturation as a number between 0-100',
               '        @param l - Luminance as a number between 0-100',
               '      */',
               '     hslToRgb(h: number, s: number, l: number): [number, number, number]',
               '  }',
               '}'
            ].join('\r\n');
            const utilitiesUrl = 'ts:filename/utilities.d.ts';

            (window as any).require(['vs/editor/editor.main'], function () {

               const thisMonaco: typeof monaco = (window as any).monaco;

               thisMonaco.languages.typescript.javascriptDefaults.addExtraLib(utilities, utilitiesUrl);
               thisMonaco.editor.createModel(utilities, 'typescript', thisMonaco.Uri.parse(utilitiesUrl));

               const editor = thisMonaco.editor.create(document.getElementById('editor-ide-container'), {
                  value: tmpScript,
                  language: 'javascript',
                  renderValidationDecorations: 'on',
                  theme: 'vs-dark'
               }) as monaco.editor.IStandaloneCodeEditor

               editor.onDidChangeModelContent(e => {
                  const script = editor.getValue();
                  localStorage.setItem('tmp-script', script);
               });
            })
         })

         return {};
      }
   });

</script>
