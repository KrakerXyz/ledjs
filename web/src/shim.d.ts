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