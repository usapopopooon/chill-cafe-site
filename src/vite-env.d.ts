/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vanillajs" />

interface ImportMetaEnv {
  readonly VITE_LEVEL_BOT_API_ORIGIN?: string
  readonly VITE_LEVEL_BOT_API_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
