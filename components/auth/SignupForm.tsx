"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { UserPlus, Mail, Lock, AlertCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import { translateSupabaseError } from "@/lib/auth/error-translator";

export default function SignupForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

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

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        console.error("Sign up error:", {
          message: signUpError.message,
          status: signUpError.status,
          code: signUpError.code,
        });
        setError(translateSupabaseError(signUpError.message));
        setLoading(false);
        return;
      }

      setSentConfirmation(true);
      setLoading(false);
    } catch (err) {
      console.error("Sign up error (unexpected):", err);
      const message =
        err instanceof Error
          ? translateSupabaseError(err.message)
          : "サインアップ中に予期せぬエラーが発生しました。時間をおいて再度お試しください。";
      setError(message);
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (resendError) {
        console.error("Resend error:", {
          message: resendError.message,
          status: resendError.status,
          code: resendError.code,
        });
        setError(translateSupabaseError(resendError.message));
      } else {
        setResent(true);
      }
    } catch (err) {
      console.error("Resend error (unexpected):", err);
      setError("再送信中に予期せぬエラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setResending(false);
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
            {email} 宛に確認メールを送信しました。メールに記載されたリンクをクリックして登録を完了してください。
          </p>
          <p className="text-xs text-ink-muted leading-relaxed">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </p>
          {error && (
            <div className="flex items-center gap-2 text-xs text-vermilion bg-vermilion/10 border border-vermilion/20 rounded-xl px-3 py-2.5 w-full">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-gold hover:brightness-125 disabled:opacity-50"
          >
            {resending ? "再送信中..." : resent ? "再送信しました" : "確認メールを再送信する"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSentConfirmation(false);
              setResent(false);
              setError(null);
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-sm text-ink-secondary hover:text-gold"
          >
            別のメールアドレスで登録し直す
          </button>
          <Link href="/login" className="text-sm text-ink-secondary hover:text-gold">
            ログイン画面へ戻る
          </Link>
          <p className="text-xs text-ink-muted leading-relaxed border-t border-gold/10 pt-4 mt-2">
            解決しない場合は{" "}
            <a
              href="mailto:steplife.contact@gmail.com"
              className="text-gold hover:brightness-125"
            >
              steplife.contact@gmail.com
            </a>{" "}
            までご連絡ください。
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="新規登録" subtitle="Kanjiiで幹事業務から解放されましょう">
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
          <UserPlus size={16} />
          {loading ? "登録中..." : "無料ではじめる"}
        </button>
      </form>

      <p className="text-center text-xs text-ink-muted mt-6">
        すでにアカウントをお持ちですか？{" "}
        <Link href="/login" className="text-gold hover:brightness-125">
          ログイン
        </Link>
      </p>
    </AuthCard>
  );
}
