/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_COCOS_PATH: string;
}
interface ImportMeta {
    readonly env: ImportMetaEnv;
}