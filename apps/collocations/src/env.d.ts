interface ImportMetaEnv {
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly RESEND_API_KEY?: string;
  readonly RESEND_BROADCAST_SEGMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
