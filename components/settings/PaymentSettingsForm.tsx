"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Landmark, Smartphone, Check, Loader2 } from "lucide-react";
import type { PaymentSettings } from "@/lib/settings/types";

const BANK_SUGGESTIONS = [
  "ゆうちょ銀行",
  "三菱UFJ銀行",
  "みずほ銀行",
  "三井住友銀行",
  "りそな銀行",
  "楽天銀行",
  "PayPay銀行",
];

export default function PaymentSettingsForm() {
  const [settings, setSettings] = useState<PaymentSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(true);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            bankName: data.settings.bank_name ?? "",
            bankBranch: data.settings.bank_branch ?? "",
            bankAccountType: data.settings.bank_account_type ?? "普通",
            bankAccountNumber: data.settings.bank_account_number ?? "",
            bankAccountHolder: data.settings.bank_account_holder ?? "",
            paypayId: data.settings.paypay_id ?? "",
            linePayId: data.settings.line_pay_id ?? "",
            memo: data.settings.memo ?? "",
          });
        }
      })
      .catch(() => {
        // no settings saved yet — leave the form blank
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/payment-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました。");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-surface-tertiary shadow-warm overflow-hidden">
        <button
          type="button"
          onClick={() => setBankOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Landmark size={16} className="text-gold" />
            銀行振込
          </span>
          <ChevronDown
            size={16}
            className={`text-gold transition-transform ${bankOpen ? "rotate-180" : ""}`}
          />
        </button>
        {bankOpen && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            <div>
              <label className="block text-xs text-ink-secondary mb-1.5">銀行名</label>
              <input
                type="text"
                value={settings.bankName ?? ""}
                onChange={(e) => update("bankName", e.target.value)}
                placeholder="例: ゆうちょ銀行"
                className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {BANK_SUGGESTIONS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => update("bankName", b)}
                    className="text-[11px] rounded-full border border-gold/15 text-ink-muted px-2.5 py-1 hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-ink-secondary mb-1.5">支店名</label>
              <input
                type="text"
                value={settings.bankBranch ?? ""}
                onChange={(e) => update("bankBranch", e.target.value)}
                placeholder="例: 渋谷支店"
                className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
              />
            </div>

            <div>
              <label className="block text-xs text-ink-secondary mb-1.5">口座種別</label>
              <div className="flex gap-2">
                {["普通", "当座"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => update("bankAccountType", t)}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold border transition-colors ${
                      settings.bankAccountType === t
                        ? "bg-gold-gradient border-transparent text-white"
                        : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-ink-secondary mb-1.5">口座番号</label>
              <input
                type="text"
                inputMode="numeric"
                value={settings.bankAccountNumber ?? ""}
                onChange={(e) => update("bankAccountNumber", e.target.value)}
                placeholder="1234567"
                className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
              />
            </div>

            <div>
              <label className="block text-xs text-ink-secondary mb-1.5">口座名義（カナ）</label>
              <input
                type="text"
                value={settings.bankAccountHolder ?? ""}
                onChange={(e) => update("bankAccountHolder", e.target.value)}
                placeholder="例: ナルセ リオ"
                className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
          <Smartphone size={16} className="text-gold" />
          電子決済
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">PayPay ID</label>
            <input
              type="text"
              value={settings.paypayId ?? ""}
              onChange={(e) => update("paypayId", e.target.value)}
              placeholder="例: @rio-narse"
              className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">LINE Pay ID</label>
            <input
              type="text"
              value={settings.linePayId ?? ""}
              onChange={(e) => update("linePayId", e.target.value)}
              placeholder="例: @rio-narse"
              className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-secondary mb-1.5">その他メモ（任意）</label>
            <textarea
              value={settings.memo ?? ""}
              onChange={(e) => update("memo", e.target.value)}
              placeholder="例: 3月末までにお願いします"
              rows={2}
              className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted resize-none"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-muted leading-relaxed px-1">
        この情報はあなたが幹事を務めるイベントのPDFにのみ表示されます。
      </p>

      {error && (
        <p className="text-xs text-vermilion-text bg-vermilion/10 border border-vermilion/20 rounded-xl px-3 py-2.5">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3.5 text-base hover:brightness-110 transition-all shadow-gold disabled:opacity-60"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : saved ? (
          <Check size={18} />
        ) : null}
        {saving ? "保存中..." : saved ? "保存しました" : "保存する"}
      </button>
    </div>
  );
}
