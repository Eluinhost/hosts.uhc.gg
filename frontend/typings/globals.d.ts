/// <reference types="vite/client" />

declare interface Document {
  hidden?: boolean;
  msHidden?: boolean;
  webkitHidden?: boolean;
}

declare module '*.scss';
declare module '*.sass';

interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
  };
}
