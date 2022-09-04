

import * as monaco from 'monaco-editor';
import { ComponentInternalInstance, computed, ComputedRef, getCurrentInstance, onMounted, onUnmounted, ref, Ref, watch } from 'vue';

export function useMonacoEditor(containerId: string, config?: Partial<EditorConfig>, componentTarget?: ComponentInternalInstance): Editor {

    const content = ref('');
    const javascript = ref('');
    const issues = ref<CodeIssue[]>([]);

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

            const model = editor.getModel();
            if (!model) {
                throw new Error('Expected model');
            }
            model.updateOptions({ tabSize: 4 });

            let typescriptWorker: monaco.languages.typescript.TypeScriptWorker | null = null;
            thisMonaco.languages.typescript.getTypeScriptWorker().then(worker => {
                worker(model.uri).then(client => {
                    typescriptWorker = client;
                    updateJavascript();
                });
            });

            const updateJavascript = () => {
                typescriptWorker?.getEmitOutput(model.uri.toString()).then(output => {
                    javascript.value = output.outputFiles[0].text;
                });
            };

            editor.onDidChangeModelDecorations(() => {
                if (!editor) {
                    return;
                }
                const markers = thisMonaco.editor.getModelMarkers({ owner: 'typescript' });
                const filtered = markers.filter(x => x.resource.path !== 'filename/global.d.ts');
                const newIssues: CodeIssue[] = filtered.map(x => {
                    return {
                        severity: x.severity === thisMonaco.MarkerSeverity.Error ? 'error' : 'warning',
                        col: x.startColumn,
                        line: x.startLineNumber,
                        message: x.message
                    };
                });
                newIssues.sort((a, b) => a.line - b.line);
                issues.value = newIssues;
            });

            let isOutgoingValue = false;
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                if (!editor) { return; }
                const newContent = editor.getValue();
                isOutgoingValue = true;
                content.value = newContent;
                updateJavascript();
            });
            
            // editor.onDidChangeModelContent(() => {
            //     if (!editor) { return; }
            //     const newContent = editor.getValue();
            //     isOutgoingValue = true;
            //     content.value = newContent;
            //     updateJavascript();
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

    return { content, issues: computed(() => issues.value), javascript: computed(() => javascript.value) };
}

export interface EditorConfig {
    typescriptLib: {
        [name: string]: string
    }
}

export interface Editor {
    content: Ref<string>;
    issues: ComputedRef<CodeIssue[]>;
    javascript: ComputedRef<string>
}

export interface CodeIssue {
    severity: 'error' | 'warning';
    line: number;
    col: number;
    message: string;
}