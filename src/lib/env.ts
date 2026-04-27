const requiredAppEnv = [
  "NEXT_PUBLIC_APP_URL",
] as const;

const requiredSupabaseEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const requiredStripeEnv = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_INVENTORY_PRICE_ID",
] as const;

export type RequiredAppEnvKey = (typeof requiredAppEnv)[number];
export type RequiredSupabaseEnvKey = (typeof requiredSupabaseEnv)[number];
export type RequiredStripeEnvKey = (typeof requiredStripeEnv)[number];

function getMissingEnv<T extends readonly string[]>(keys: T, env: NodeJS.ProcessEnv = process.env) {
  return keys.filter((key) => !env[key]);
}

export function getMissingAppEnv(env: NodeJS.ProcessEnv = process.env) {
  return getMissingEnv(requiredAppEnv, env);
}

export function getMissingSupabaseEnv(env: NodeJS.ProcessEnv = process.env) {
  return getMissingEnv(requiredSupabaseEnv, env);
}

export function getMissingStripeEnv(env: NodeJS.ProcessEnv = process.env) {
  return getMissingEnv(requiredStripeEnv, env);
}

export function assertAppEnv(env: NodeJS.ProcessEnv = process.env) {
  const missing = getMissingAppEnv(env);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return env as NodeJS.ProcessEnv & Record<RequiredAppEnvKey, string>;
}

export function assertSupabaseEnv(env: NodeJS.ProcessEnv = process.env) {
  const missing = getMissingSupabaseEnv(env);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return env as NodeJS.ProcessEnv & Record<RequiredSupabaseEnvKey, string>;
}

export function assertStripeEnv(env: NodeJS.ProcessEnv = process.env) {
  const missing = getMissingStripeEnv(env);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return env as NodeJS.ProcessEnv & Record<RequiredStripeEnvKey, string>;
}
