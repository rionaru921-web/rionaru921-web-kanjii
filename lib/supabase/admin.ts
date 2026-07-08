import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Uses the service_role key to bypass RLS — only for reading public share
// pages, where the visitor has no Supabase session to satisfy the
// "auth.uid() = user_id" policies on payment_settings/history/share_tokens.
// Never import this outside of the /share/[token] flow.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
