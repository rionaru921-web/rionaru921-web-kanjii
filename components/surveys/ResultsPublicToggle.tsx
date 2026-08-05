"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResultsPublicToggle({ slug, initialValue }: { slug: string; initialValue: boolean }) {
  const [isPublic, setIsPublic] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !isPublic;
    setSaving(true);
    try {
      const res = await fetch(`/api/surveys/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultsPublic: next }),
      });
      if (!res.ok) throw new Error();
      setIsPublic(next);
    } catch {
      // 失敗時は表示を変えない(楽観更新しない)
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className="flex items-center gap-2 rounded-xl border border-gold/20 px-3 py-2 text-xs font-medium text-ink-secondary hover:border-gold/40 transition-colors disabled:opacity-50"
    >
      {saving ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isPublic ? (
        <Eye size={14} className="text-gold" />
      ) : (
        <EyeOff size={14} className="text-ink-muted" />
      )}
      {isPublic ? "回答者にも集計を公開中" : "集計は非公開"}
    </button>
  );
}
