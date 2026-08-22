"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateSupabaseError } from "@/lib/auth/error-translator";

function AppleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.665 15.29c-.03-3.24 2.646-4.8 2.766-4.876-1.512-2.21-3.864-2.513-4.698-2.548-2.001-.203-3.9 1.178-4.914 1.178-1.014 0-2.583-1.148-4.245-1.116-2.184.032-4.197 1.27-5.322 3.226-2.268 3.93-.579 9.75 1.632 12.943 1.08 1.562 2.373 3.312 4.062 3.25 1.629-.066 2.247-1.05 4.221-1.05 1.956 0 2.532 1.05 4.257 1.011 1.761-.03 2.874-1.577 3.945-3.15 1.245-1.808 1.758-3.559 1.779-3.649-.039-.017-3.414-1.31-3.483-5.219z" />
      <path d="M16.716 5.876c.894-1.084 1.497-2.588 1.332-4.086-1.29.052-2.85.858-3.774 1.94-.822.955-1.548 2.512-1.359 3.964 1.428.11 2.895-.723 3.801-1.818z" />
    </svg>
  );
}

export default function AppleLoginButton({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("redirectTo", redirectTo);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: callbackUrl.toString() },
    });

    if (oauthError) {
      setError(translateSupabaseError(oauthError.message));
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-full bg-black text-white font-semibold py-2.5 text-sm hover:brightness-125 transition-all disabled:opacity-50"
      >
        <AppleIcon />
        {loading ? "リダイレクト中..." : "Appleでサインイン"}
      </button>
      {error && <p className="text-xs text-vermilion-text text-center">{error}</p>}
    </div>
  );
}
