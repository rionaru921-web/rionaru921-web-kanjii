"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, AlertCircle, Loader2 } from "lucide-react";

const CONFIRM_WORD = "削除";

interface DeleteAccountFormProps {
  email: string;
  plansCount: number;
  surveysCount: number;
}

export default function DeleteAccountForm({ email, plansCount, surveysCount }: DeleteAccountFormProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === CONFIRM_WORD && !deleting;

  async function handleDelete() {
    if (!canDelete) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "アカウントの削除に失敗しました。時間をおいて再度お試しください。");
        setDeleting(false);
        return;
      }
      router.push("/account/delete/complete");
    } catch {
      setError("通信エラーが発生しました。ネットワーク接続をご確認のうえ再度お試しください。");
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 sm:p-8">
      <h1 className="font-serif font-bold text-xl text-ink mb-1">アカウント削除</h1>
      <p className="text-sm text-ink-secondary mb-6">{email}</p>

      <div className="flex items-start gap-2.5 rounded-xl bg-vermilion/10 border border-vermilion/20 px-4 py-3.5 mb-5">
        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-vermilion-text" />
        <p className="text-sm text-vermilion-text leading-relaxed">
          この操作は取り消せません。削除すると、アカウントとすべてのデータに二度とアクセスできなくなります。
        </p>
      </div>

      <div className="rounded-xl border border-gold/15 px-4 py-3.5 mb-5">
        <p className="text-xs font-medium text-ink-secondary mb-2">削除される内容</p>
        <ul className="text-sm text-ink space-y-1 list-disc list-inside">
          <li>作成した幹事プラン（{plansCount}件）</li>
          <li>作成したアンケート（{surveysCount}件）</li>
          <li>認証情報（メールアドレス・パスワード）</li>
        </ul>
      </div>

      <label className="block text-sm text-ink-secondary mb-1.5">
        続行するには「{CONFIRM_WORD}」と入力してください
      </label>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={CONFIRM_WORD}
        disabled={deleting}
        className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-vermilion/50 disabled:opacity-50 mb-5"
      />

      {error && (
        <div className="flex items-center gap-2 text-xs text-vermilion-text bg-vermilion/10 border border-vermilion/20 rounded-xl px-3 py-2.5 mb-5">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/settings/profile"
          className="flex-1 flex items-center justify-center rounded-xl border border-gold/15 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/5"
        >
          キャンセル
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-vermilion py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
          {deleting ? "削除中..." : "削除する"}
        </button>
      </div>
    </div>
  );
}
