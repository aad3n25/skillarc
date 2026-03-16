import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Server-side Supabase client — for use in API Route Handlers (app/api/) only.
// Never import this in Client Components or pages rendered in the browser.
// Uses the same anon key; swap to a service-role key only for admin operations
// that must bypass RLS (store that key in a non-NEXT_PUBLIC_ variable).
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
    );
  }

  return createSupabaseClient<Database>(url, key);
}
