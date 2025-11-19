/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_LIVE_API?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_TOKEN?: string;
  readonly VITE_ALERT_EMAIL_WEBHOOK?: string;
  readonly VITE_ALERT_SMS_WEBHOOK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
