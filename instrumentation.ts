/**
 * Next.js instrumentation hook — runs once on server startup.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env')
    try {
      validateEnv()
    } catch (err) {
      // Log the error but don't crash the server in production to allow
      // partial functionality (e.g., static pages) to still be served.
      console.error('[CalSnap] Environment validation failed:', (err as Error).message)
    }
  }
}
