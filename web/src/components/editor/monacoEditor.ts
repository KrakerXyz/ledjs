
import type * as monaco from 'monaco-editor';
import { ComponentInternalInstance, onMounted, onUnmounted, ref, Ref, watch } from 'vue';

export function useMonacoEditor(containerId: string, config?: Partial<EditorConfig>, componentTarget?: ComponentInternalInstance): { content: Ref<string>, errorMarkers: Ref<monaco.editor.IMarker[]> } {

    const content = ref('');
    const errorMarkers = ref<monaco.editor.IMarker[]>([]);

    let editor: monaco.editor.IStandaloneCodeEditor | undefined;

    onMounted(() => {

        (window as any).require(['vs/editor/editor.main'], function () {
            const ideContainer = document.getElementById(containerId);
            if (!ideContainer) { console.error(`#${containerId} not found`); return; }

            const thisMonaco: typeof monaco = (window as any).monaco;

            if (config?.javascriptLib) {
                for (const k of Object.getOwnPropertyNames(config.javascriptLib)) {
                    const libUrl = `ts:filename/${k}.d.ts`;
                    if (thisMonaco.languages.typescript.javascriptDefaults.getExtraLibs()[libUrl]) { continue; }
                    const lib = config.javascriptLib[k];
                    thisMonaco.languages.typescript.javascriptDefaults.addExtraLib(lib, libUrl);
                    thisMonaco.editor.createModel(lib, 'typescript', thisMonaco.Uri.parse(libUrl));
                }
            }

            editor = thisMonaco.editor.create(ideContainer, {
                value: content.value,
                language: 'javascript',
                renderValidationDecorations: 'off',
                theme: 'vs-dark'
            }) as monaco.editor.IStandaloneCodeEditor;

            let isOutgoingValue = false;
            editor.onDidChangeModelContent(() => {
                if (!editor) { return; }
                const newContent = editor.getValue();
                isOutgoingValue = true;
                content.value = newContent;
            });

            // editor.onDidChangeModelDecorations(e => {
            //     const markers = thisMonaco.editor.getModelMarkers({ owner: 'javascript' });
            //     errorMarkers.value = markers.filter(m => m.severity === 8);
            // });

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
    javascriptLib: {
        [name: string]: string
    }
}