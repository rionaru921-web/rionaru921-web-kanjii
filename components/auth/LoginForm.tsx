"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import { translateSupabaseError } from "@/lib/auth/error-translator";

export default function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFields />
    </Suspense>
  );
}

function LoginFields() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(
    searchParams.get("verify") === "required"
  );
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResent(false);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Sign in error:", {
          message: signInError.message,
          status: signInError.status,
          code: signInError.code,
        });
        setError(translateSupabaseError(signInError.message));
        setNeedsVerification(false);
        setLoading(false);
        return;
      }

      if (!data.user.email_confirmed_at) {
        // A session was issued for an unconfirmed account — don't let it stand.
        await supabase.auth.signOut();
        setError(translateSupabaseError("Email not confirmed"));
        setNeedsVerification(true);
        setLoading(false);
        return;
      }

      const redirectTo = searchParams.get("redirectTo") || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Sign in error (unexpected):", err);
      const message =
        err instanceof Error
          ? translateSupabaseError(err.message)
          : "ログイン中に予期せぬエラーが発生しました。時間をおいて再度お試しください。";
      setError(message);
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setError("再送信するメールアドレスを入力してください。");
      return;
    }
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

  return (
    <AuthCard title="ログイン" subtitle="幹事ラボへおかえりなさい">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {needsVerification && !error && (
          <div className="flex items-center gap-2 text-xs text-gold bg-gold/10 border border-gold/20 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0" />
            メール確認が必要です。届いた確認メールのリンクをクリックしてください。
          </div>
        )}

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
            placeholder="••••••••"
            className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
          />
        </div>

        <div className="flex justify-end -mt-2">
          <Link
            href="/forgot-password"
            className="text-xs text-ink-muted hover:text-gold transition-colors"
          >
            パスワードをお忘れですか？
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-vermilion bg-vermilion/10 border border-vermilion/20 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {needsVerification && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-xs text-gold hover:brightness-125 disabled:opacity-50 -mt-1 text-left"
          >
            {resending ? "再送信中..." : resent ? "確認メールを再送信しました" : "確認メールを再送信する"}
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3 text-sm hover:brightness-110 transition-all shadow-gold disabled:opacity-50 mt-2"
        >
          <LogIn size={16} />
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="text-center text-xs text-ink-muted mt-6">
        アカウントをお持ちでないですか？{" "}
        <Link href="/signup" className="text-gold hover:brightness-125">
          新規登録
        </Link>
      </p>
    </AuthCard>
  );
}
