/**
 * Centralised environment variable validation.
 * Import this at the top of any server-side entrypoint to fail fast with a
 * clear message instead of cryptic runtime errors deep in the call stack.
 */

const REQUIRED_SERVER = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'GOOGLE_AI_API_KEY',
] as const

const OPTIONAL_SERVER = [
    'VAPID_PRIVATE_KEY',
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
] as const

export function validateEnv() {
    const missing: string[] = []

    for (const key of REQUIRED_SERVER) {
        const val = process.env[key]
        if (!val || val.startsWith('your_') || val.length < 8) {
            missing.push(key)
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `[CalSnap] Missing required environment variables:\n  ${missing.join('\n  ')}\n\nPlease add them to .env.local and restart the dev server.`
        )
    }
}

/** Typed env object — use instead of process.env for autocomplete & safety */
export const env = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    googleAiKey: process.env.GOOGLE_AI_API_KEY!,
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
} as const
