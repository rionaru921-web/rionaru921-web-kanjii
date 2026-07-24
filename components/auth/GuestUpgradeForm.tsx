"use client";

import { useState, type FormEvent } from "react";
import { UserPlus, Mail, Lock, AlertCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import { translateSupabaseError } from "@/lib/auth/error-translator";

export default function GuestUpgradeForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }
    if (!agreedToTerms) {
      setError("利用規約・プライバシーポリシー・ベータ利用規約への同意が必要です。");
      return;
    }

    setLoading(true);
    try {
      // ゲスト(匿名ユーザー)の auth.users.id は変わらないまま email/password
      // が付与される。既存の manual_plans 等はすべて user_id で紐づいている
      // ため、コピー処理なしでそのまま本登録アカウントのデータになる。
      const { error: updateError } = await supabase.auth.updateUser(
        { email, password },
        { emailRedirectTo: `${window.location.origin}/dashboard` }
      );

      if (updateError) {
        console.error("Guest upgrade error:", {
          message: updateError.message,
          status: updateError.status,
          code: updateError.code,
        });
        setError(translateSupabaseError(updateError.message));
        setLoading(false);
        return;
      }

      setSentConfirmation(true);
      setLoading(false);
    } catch (err) {
      console.error("Guest upgrade error (unexpected):", err);
      const message =
        err instanceof Error
          ? translateSupabaseError(err.message)
          : "登録中に予期せぬエラーが発生しました。時間をおいて再度お試しください。";
      setError(message);
      setLoading(false);
    }
  }

  if (sentConfirmation) {
    return (
      <AuthCard title="確認メールを送信しました">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold">
            <MailCheck size={26} />
          </span>
          <p className="text-sm text-ink-secondary leading-relaxed">
            {email} 宛に確認メールを送信しました。メールに記載されたリンクをクリックすると、これまでのデータを引き継いだまま本登録が完了します。
          </p>
          <p className="text-xs text-ink-muted leading-relaxed">
            確認後にこのメールアドレスでログインできない場合は、ログイン画面の「パスワードをお忘れですか？」からパスワードを再設定してください。
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="アカウントを作成してデータを引き継ぐ"
      subtitle="メールアドレスとパスワードを設定すると、ゲストとして作成したデータがそのまま本登録アカウントに引き継がれます"
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

        <div>
          <label className="flex items-center gap-1.5 text-xs text-ink-secondary mb-1.5">
            <Lock size={14} />
            パスワード
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6文字以上"
            className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs text-ink-secondary mb-1.5">
            <Lock size={14} />
            パスワード（確認）
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="もう一度入力"
            className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-ink-secondary leading-relaxed">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 accent-gold"
          />
          <span>
            <a href="/legal/terms" className="text-gold hover:brightness-125">
              利用規約
            </a>
            ・
            <a href="/legal/privacy" className="text-gold hover:brightness-125">
              プライバシーポリシー
            </a>
            ・
            <a href="/legal/beta" className="text-gold hover:brightness-125">
              ベータ利用規約
            </a>
            に同意します
          </span>
        </label>

        {error && (
          <div className="flex items-center gap-2 text-xs text-vermilion-text bg-vermilion/10 border border-vermilion/20 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !agreedToTerms}
          className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3 text-sm hover:brightness-110 transition-all shadow-gold disabled:opacity-50 mt-2"
        >
          <UserPlus size={16} />
          {loading ? "登録中..." : "アカウントを作成する"}
        </button>
      </form>
    </AuthCard>
  );
}
