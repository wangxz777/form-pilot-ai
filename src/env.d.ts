/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GENERATE_FORM_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:svg-icons-register'
