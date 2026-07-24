"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateSupabaseError } from "@/lib/auth/error-translator";

export default function GuestLoginButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuestLogin() {
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInAnonymously();
    if (signInError) {
      setError(translateSupabaseError(signInError.message));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={handleGuestLogin}
        disabled={loading}
        className={
          className ||
          "flex items-center gap-1.5 text-sm text-ink-secondary hover:text-gold transition-colors disabled:opacity-50"
        }
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <UserRound size={14} />}
        {loading ? "準備中..." : "ログインせずゲストで試す"}
      </button>
      {error && <p className="text-xs text-vermilion-text text-center">{error}</p>}
    </div>
  );
}
