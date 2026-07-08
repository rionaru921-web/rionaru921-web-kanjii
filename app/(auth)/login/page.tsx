"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("メールアドレスまたはパスワードが正しくありません。");
      setLoading(false);
      return;
    }

    const redirectTo = searchParams.get("redirectTo") || "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <AuthCard title="ログイン" subtitle="Kanjiiへおかえりなさい">
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
