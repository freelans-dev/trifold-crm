/**
 * Centralized environment variable access.
 * Uses getters to defer validation to runtime (not build time),
 * since server-side env vars are not available during next build.
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env.local file.`
    )
  }
  return value
}

export const env = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    return requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  },
} as const
