
interface ImportMeta {
    env?: {
        MODE: 'development' | 'production',
        VITE_GOOGLE_CLIENT_ID?: string,
    },
    glob(g: string): Record<string, Promise<any>>,
}

declare module '*?raw' {
    const content: string;
    export default content;
}

declare module '*?worker' {
    const content: new() => Worker;
    export default content;
}

declare module '*.vue' {
    import type { defineComponent } from 'vue';
    const component: ReturnType<typeof defineComponent>;
    export default component;
}

declare module 'monaco-editor/esm/vs/editor/editor.worker?worker' {
    const editorWorker: any;
}

declare module 'monaco-editor/esm/vs/language/json/json.worker?worker' {
    const jsonWorker: any;
}

declare module 'monaco-editor/esm/vs/language/css/css.worker?worker' {
    const cssWorker: any;
}

declare module 'monaco-editor/esm/vs/language/html/html.worker?worker' {
    const htmlWorker: any;
}

declare module 'monaco-editor/esm/vs/language/typescript/ts.worker?worker' {
    const tsWorker: any;
}

declare global {
    const google: typeof import('google.accounts');
    const gapi: typeof import('gapi.auth2');
}