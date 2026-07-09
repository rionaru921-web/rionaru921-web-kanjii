"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateSupabaseError } from "@/lib/auth/error-translator";

interface ProfileEditModalProps {
  userId: string;
  initialDisplayName: string;
  initialEmail: string;
  onClose: () => void;
}

export default function ProfileEditModal({
  userId,
  initialDisplayName,
  initialEmail,
  onClose,
}: ProfileEditModalProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const trimmedName = displayName.trim();
  const trimmedEmail = email.trim();
  const nameChanged = trimmedName !== initialDisplayName && trimmedName.length > 0;
  const emailChanged = trimmedEmail !== initialEmail && trimmedEmail.length > 0;

  async function handleSave() {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (nameChanged) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ display_name: trimmedName })
          .eq("id", userId);
        if (profileError) throw profileError;
      }

      if (emailChanged) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: trimmedEmail,
        });
        if (emailError) throw emailError;
      }

      if (emailChanged) {
        setSuccess("確認メールを送信しました。新しいメールアドレスの受信箱をご確認ください。");
        router.refresh();
      } else {
        router.refresh();
        onClose();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      setError(translateSupabaseError(message) || "保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-md bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="font-serif font-bold text-lg text-ink">プロフィール編集</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            表示名とメールアドレスを変更できます
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink">表示名</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                disabled={loading}
                className="mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
                placeholder="表示名を入力"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
                placeholder="you@example.com"
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                変更時は新しいアドレスに確認メールが届きます
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-sage/30 bg-sage/10 px-3 py-2.5 text-sm text-sage">
                {success}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-gold/15 bg-surface-tertiary py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/5 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || (!nameChanged && !emailChanged)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              保存する
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
