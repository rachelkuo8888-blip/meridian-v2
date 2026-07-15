import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

/**
 * Server-side Supabase client for App Router.
 * Uses SSR cookie-based auth for route handlers and server components.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) =>
              cookieStore.set(name, value),
            );
          } catch {
            // Called from Server Component — can ignore (middleware refresh handles it)
          }
        },
      },
    },
  );
}

/**
 * Route handler client (for POST/PUT route handlers that need cookie read/write).
 * Requires the cookieStore from the request context.
 */
export function createRouteHandlerClient(cookieStore: RequestCookies) {
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            cookieStore.set(name, value),
          );
        },
      },
    },
  );
}
