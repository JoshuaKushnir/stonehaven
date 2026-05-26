/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY?: string;
  readonly QUOTE_TO_EMAIL?: string;
  readonly QUOTE_FROM_EMAIL?: string;
  readonly SITE_URL?: string;
  readonly SANITY_PROJECT_ID?: string;
  readonly SANITY_DATASET?: string;
  readonly OPENAI_API_KEY?: string;
  readonly OPENAI_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
