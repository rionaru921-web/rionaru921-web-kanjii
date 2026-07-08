import { Wallet } from "lucide-react";
import PaymentSettingsForm from "@/components/settings/PaymentSettingsForm";

export default function PaymentSettingsPage() {
  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-2xl text-ink mb-1 flex items-center gap-2">
        <Wallet size={22} className="text-gold" />
        集金設定
      </h1>
      <p className="text-sm text-ink-secondary mb-6">
        オプション: 幹事の集金情報をPDFに自動挿入したい場合に設定してください。未設定でもKanjiiの全機能はご利用いただけます。
      </p>
      <PaymentSettingsForm />
    </main>
  );
}
