
import type * as monaco from 'monaco-editor';
import { ref, Ref, watch } from 'vue';

export function useMonacoEditor(containerId: string, config?: Partial<EditorConfig>): { content: Ref<string> } {

    const content = ref('');

    (window as any).require(['vs/editor/editor.main'], function () {
        const ideContainer = document.getElementById(containerId);
        if (!ideContainer) { console.error(`#${containerId} not found`); return; }

        const thisMonaco: typeof monaco = (window as any).monaco;

        if (config?.javascriptLib) {
            for (const k of Object.getOwnPropertyNames(config.javascriptLib)) {
                const libUrl = `ts:filename/${k}.d.ts`;
                const lib = config.javascriptLib[k];
                thisMonaco.languages.typescript.javascriptDefaults.addExtraLib(lib, libUrl);
                thisMonaco.editor.createModel(lib, 'typescript', thisMonaco.Uri.parse(libUrl));
            }
        }

        const editor = thisMonaco.editor.create(ideContainer, {
            value: content.value,
            language: 'javascript',
            renderValidationDecorations: 'on',
            theme: 'vs-dark'
        }) as monaco.editor.IStandaloneCodeEditor

        let isOutgoingValue = false;
        editor.onDidChangeModelContent(e => {
            const newContent = editor.getValue();
            isOutgoingValue = true;
            content.value = newContent;
        });

        watch(content, c => {
            if (isOutgoingValue) { isOutgoingValue = false; return; }
            editor.setValue(c);
        }, { immediate: true });

    });

    return { content };
}

export interface EditorConfig {
    javascriptLib: {
        [name: string]: string
    }
}