/**
 * tRPC Context
 * Defines what context is available in all tRPC procedures
 */

import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import prisma from '@/lib/db/prisma';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Defines the context that will be available in all tRPC procedures
 * - session: The authenticated user session (from Supabase)
 * - prisma: The Prisma client for database access
 * - req: The Next.js request object
 * - res: The Next.js response object
 */
export async function createContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;

  // Get the session from Supabase
  const supabase = supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    req,
    res,
    prisma,
    session,
    supabase,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
