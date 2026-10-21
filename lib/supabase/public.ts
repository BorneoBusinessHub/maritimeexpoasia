import { createClient } from "@supabase/supabase-js";

// Anonymous, cookie-free client for public reads. RLS limits it to published rows.
export function publicClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
