"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { KeyRound, Mail, AlertCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined,
      }
    );

    if (resetError) {
      setError("メールの送信に失敗しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthCard title="再設定メールを送信しました">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold">
            <MailCheck size={26} />
          </span>
          <p className="text-sm text-ink-secondary leading-relaxed">
            {email} 宛にパスワード再設定用のリンクを送信しました。メールをご確認ください。
          </p>
          <Link href="/login" className="text-sm text-gold hover:brightness-125">
            ログイン画面へ戻る
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="パスワードをお忘れですか？"
      subtitle="登録済みのメールアドレスに再設定用のリンクをお送りします"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs text-ink-secondary mb-1.5">
            <Mail size={14} />
            メールアドレス
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-vermilion bg-vermilion/10 border border-vermilion/20 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3 text-sm hover:brightness-110 transition-all shadow-gold disabled:opacity-50 mt-2"
        >
          <KeyRound size={16} />
          {loading ? "送信中..." : "再設定メールを送る"}
        </button>
      </form>

      <p className="text-center text-xs text-ink-muted mt-6">
        <Link href="/login" className="text-gold hover:brightness-125">
          ログイン画面へ戻る
        </Link>
      </p>
    </AuthCard>
  );
}
