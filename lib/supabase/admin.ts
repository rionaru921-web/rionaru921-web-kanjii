import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Uses the service_role key to bypass RLS. Two trusted server-only uses:
// 1. Public share pages (/share/[token]), where the visitor has no Supabase
//    session to satisfy the "auth.uid() = user_id" policies.
// 2. Writing tables that intentionally have no client-writable RLS policy
//    (e.g. guest_ai_usage, cron guest cleanup) — the caller must verify the
//    request itself (session user id, cron secret) before using this client.
// Never import this into client components or expose it to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
