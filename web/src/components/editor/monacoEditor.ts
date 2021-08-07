

import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import { ComponentInternalInstance, onMounted, onUnmounted, ref, Ref, watch } from 'vue';

(self as any).MonacoEnvironment = {
    getWorker(_: any, label: any) {
        if (label === 'json') {
            return new (jsonWorker as any)();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new (cssWorker as any)();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new (htmlWorker as any)();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new (tsWorker as any)();
        }
        return new (editorWorker as any)();
    }
};

export function useMonacoEditor(containerId: string, config?: Partial<EditorConfig>, componentTarget?: ComponentInternalInstance): { content: Ref<string>, errorMarkers: Ref<monaco.editor.IMarker[]> } {

    const content = ref('');
    const errorMarkers = ref<monaco.editor.IMarker[]>([]);

    let editor: monaco.editor.IStandaloneCodeEditor | undefined;

    onMounted(() => {

        const ideContainer = document.getElementById(containerId);
        if (!ideContainer) { console.error(`#${containerId} not found`); return; }


        if (config?.javascriptLib) {
            for (const k of Object.getOwnPropertyNames(config.javascriptLib)) {
                const libUrl = `ts:filename/${k}.d.ts`;
                if (monaco.languages.typescript.javascriptDefaults.getExtraLibs()[libUrl]) { continue; }
                const lib = config.javascriptLib[k];
                monaco.languages.typescript.javascriptDefaults.addExtraLib(lib, libUrl);
                monaco.editor.createModel(lib, 'typescript', monaco.Uri.parse(libUrl));
            }
        }

        editor = monaco.editor.create(ideContainer, {
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


    }, componentTarget);

    return { content, errorMarkers };
}

export interface EditorConfig {
    javascriptLib: {
        [name: string]: string
    }
}