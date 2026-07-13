"use client";

import { useState } from "react";
import { RotateCcw, Check, Loader2 } from "lucide-react";

// Recovery action for the guest_secret model (see
// app/api/share/plan/[token]/identify/route.ts): a guest's claim on their
// member row is permanent by design (first claim wins), so if they lose
// their session, only the plan owner can clear it and let them re-identify.
export default function MemberGuestSecretReset({
  planId,
  memberId,
}: {
  planId: string;
  memberId: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleReset() {
    setState("loading");
    try {
      const res = await fetch(`/api/manual-plans/${planId}/members/${memberId}/reset-guest-secret`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="flex items-center gap-1 text-[11px] text-emerald-600">
        <Check size={12} />
        リセット済み
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={state === "loading"}
      className="flex items-center gap-1 text-[11px] text-ink-muted hover:text-gold transition-colors disabled:opacity-60"
      title="この人の回答登録をリセットして、別の端末から選び直せるようにします"
    >
      {state === "loading" ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
      {state === "error" ? "失敗しました" : "回答をリセット"}
    </button>
  );
}
