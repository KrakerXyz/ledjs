// eslint-disable-next-line @typescript-eslint/naming-convention
interface ImportMeta {
   env?: {
      MODE: 'development' | 'production';
      VITE_GOOGLE_CLIENT_ID?: string;
   };
   glob(g: string): Record<string, Promise<any>>;
}

declare module '*.vue' {
   import { defineComponent } from 'vue';
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