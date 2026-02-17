/**
 * tRPC Context
 * Defines what context is available in all tRPC procedures
 */

import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import prisma from '@/lib/db/prisma';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Defines the context that will be available in all tRPC procedures
 * - session: The authenticated user session (from Supabase)
 * - prisma: The Prisma client for database access
 * - req: The fetch request object
 */
export async function createContext(opts: FetchCreateContextFnOptions) {
  const { req } = opts;

  // Get the session from Supabase (using cookies from request)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Create a Supabase client that can read cookies from the request
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return req.headers.get('cookie')
          ?.split('; ')
          .find(c => c.startsWith(`${name}=`))
          ?.split('=')[1];
      },
      set(name: string, value: string, options: CookieOptions) {
        // Not used in API routes
      },
      remove(name: string, options: CookieOptions) {
        // Not used in API routes
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    req,
    prisma,
    session,
    supabase,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
