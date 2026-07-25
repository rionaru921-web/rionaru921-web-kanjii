"use client";

import { Loader2, UserRound } from "lucide-react";
import { useGuestSignIn } from "@/lib/auth/useGuestSignIn";

export default function GuestLoginButton({
  className = "",
  redirectTo = "/dashboard",
}: {
  className?: string;
  redirectTo?: string;
}) {
  const { start, loading, error } = useGuestSignIn(redirectTo);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={start}
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
