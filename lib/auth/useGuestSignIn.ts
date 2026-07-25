"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateSupabaseError } from "@/lib/auth/error-translator";

// Extracted from GuestLoginButton so the Hero's primary CTA can trigger the
// same anonymous sign-in flow but land somewhere other than /dashboard
// (the create-plan form) without duplicating the Supabase call + error
// handling in two places.
export function useGuestSignIn(redirectTo: string = "/dashboard") {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) {
      setError(translateSupabaseError(signInError.message));
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return { start, loading, error };
}
