const required = [
  "NEXT_PUBLIC_APP_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
] as const;

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? "dev-admin-secret",
  csrfSecret: process.env.CSRF_SECRET ?? "dev-csrf-secret",
  ipHashSalt: process.env.IP_HASH_SALT ?? "dev-ip-hash-salt",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10),
};

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function missingCriticalEnv() {
  return required.filter((key) => !process.env[key]);
}
