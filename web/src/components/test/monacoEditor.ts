

import type * as monaco from 'monaco-editor';
import { ComponentInternalInstance, getCurrentInstance, onMounted, onUnmounted, ref, Ref, watch } from 'vue';

export function useMonacoEditor(containerId: string, config?: Partial<EditorConfig>, componentTarget?: ComponentInternalInstance): { content: Ref<string>, errorMarkers: Ref<monaco.editor.IMarker[]> } {

    const content = ref('');
    const errorMarkers = ref<monaco.editor.IMarker[]>([]);

    let editor: monaco.editor.IStandaloneCodeEditor | undefined;

    componentTarget ??= getCurrentInstance() ?? undefined;
    if (!componentTarget) {
        throw new Error('Component instance not defined');
    }

    onMounted(() => {

        (window as any).require(['vs/editor/editor.main'], function () {
            const ideContainer = document.getElementById(containerId);
            if (!ideContainer) { console.error(`#${containerId} not found`); return; }

            const thisMonaco: typeof monaco = (window as any).monaco;

            const defaults = thisMonaco.languages.typescript.typescriptDefaults.getCompilerOptions();
            defaults.target = thisMonaco.languages.typescript.ScriptTarget.ESNext;
            defaults.strict = true;
            defaults.experimentalDecorators = true;
            defaults.lib = ['esnext'];
            thisMonaco.languages.typescript.typescriptDefaults.setCompilerOptions(defaults);

            if (config?.typescriptLib) {
                for (const k of Object.getOwnPropertyNames(config.typescriptLib)) {
                    const libUrl = `ts:filename/${k}.d.ts`;
                    if (thisMonaco.languages.typescript.javascriptDefaults.getExtraLibs()[libUrl]) { continue; }
                    const lib = config.typescriptLib[k];
                    thisMonaco.languages.typescript.typescriptDefaults.addExtraLib(lib, libUrl);
                    thisMonaco.editor.createModel(lib, 'typescript', thisMonaco.Uri.parse(libUrl));
                }
            }



            editor = thisMonaco.editor.create(ideContainer, {
                value: content.value,
                language: 'typescript',
                //renderValidationDecorations: 'off',
                theme: 'vs-dark',
                wordWrap: 'on',
                wrappingIndent: 'indent',
                lineNumbers: 'on',
            }) as monaco.editor.IStandaloneCodeEditor;

            editor.getModel()?.updateOptions({ tabSize: 3 });

            let isOutgoingValue = false;
            editor.onDidChangeModelContent(() => {
                if (!editor) { return; }
                const newContent = editor.getValue();
                isOutgoingValue = true;
                content.value = newContent;
            });

            watch(content, c => {
                if (isOutgoingValue) { isOutgoingValue = false; return; }
                editor!.setValue(c);
            }, { immediate: true });

            const obs = new ResizeObserver(() => {
                if (!editor) { return; }
                editor.layout();
            });

            obs.observe(ideContainer);

            onUnmounted(() => {
                obs.disconnect();
            }, componentTarget);

        });

    }, componentTarget);

    return { content, errorMarkers };
}

export interface EditorConfig {
    typescriptLib: {
        [name: string]: string
    }
}