"use client";

import { useState } from "react";
import { Loader2, PartyPopper } from "lucide-react";

export default function PremiumWaitlistForm() {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/premium/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interestReason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "登録に失敗しました。");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 text-center text-gold py-2">
        <PartyPopper size={24} />
        <p className="text-sm font-semibold text-ink">事前登録ありがとうございます！</p>
        <p className="text-xs text-ink-muted">Premiumプラン開始時にご連絡します</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Premiumプランに期待することを教えてください（任意）"
        rows={3}
        disabled={submitting}
        className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-50 resize-none"
      />
      {error && <p className="text-xs text-vermilion-text">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3 text-sm hover:brightness-110 transition-all shadow-gold disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        事前登録する（無料）
      </button>
      <p className="text-xs text-ink-muted text-center">Premiumプラン開始時に優先案内します</p>
    </div>
  );
}
