declare interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: <R>(a: R) => R;
}

declare interface Document {
  hidden?: boolean;
  msHidden?: boolean;
  webkitHidden?: boolean;
}

declare module '*.scss';
declare module '*.sass';
declare module '*.css';

interface ImportMeta {
  readonly env: {
    readonly BASE_URL: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
  };
}
