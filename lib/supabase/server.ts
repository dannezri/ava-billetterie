/**
 * Supabase server-side clients
 * - createClient: For authenticated user requests (uses cookies)
 * - supabaseAdmin: For admin operations (bypasses RLS)
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from './server-client';

// Export the authenticated client creator
export const createClient = createAuthClient;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}

export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabaseAdmin;
