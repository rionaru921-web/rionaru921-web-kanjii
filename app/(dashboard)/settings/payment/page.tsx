import { Wallet, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PaymentSettingsForm from "@/components/settings/PaymentSettingsForm";

export default async function PaymentSettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isGuest = !!user?.is_anonymous;

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1 flex items-center gap-2">
        <Wallet size={22} className="text-gold" />
        集金設定
      </h1>
      <p className="text-sm text-ink-secondary mb-6">
        オプション: 幹事の集金情報をPDFに自動挿入したい場合に設定してください。未設定でも幹事ラボの全機能はご利用いただけます。
      </p>

      {isGuest ? (
        <div className="flex flex-col items-center text-center gap-3 rounded-3xl bg-surface-tertiary shadow-warm p-8">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gold/10 text-gold">
            <Lock size={20} />
          </span>
          <p className="text-sm text-ink-secondary leading-relaxed">
            集金設定には銀行口座情報などが含まれるため、ゲストモードではご利用いただけません。アカウントを作成すると設定できるようになります。
          </p>
          <Link
            href="/settings/upgrade"
            className="mt-2 rounded-full bg-gold-gradient text-white text-sm font-bold px-6 py-2.5 hover:brightness-110 transition-all shadow-gold"
          >
            アカウントを作成する
          </Link>
        </div>
      ) : (
        <PaymentSettingsForm />
      )}
    </main>
  );
}
