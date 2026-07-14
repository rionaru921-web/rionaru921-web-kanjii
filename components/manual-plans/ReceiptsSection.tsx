"use client";

import { Receipt, Plus } from "lucide-react";
import { useToasts, ToastStack } from "@/components/ui/RealtimeToast";

// UI shell only — the actual receipt upload/storage feature ships in Wave 4.
// Only rendered for completed plans (see app/manual-plans/[id]/page.tsx),
// matching the "receipts can still be added after completion" exception to
// the otherwise-locked edit surface.
export default function ReceiptsSection() {
  const { toasts, pushToast } = useToasts();

  return (
    <section className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex items-start gap-3">
      <Receipt className="text-gold shrink-0" size={18} />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-muted mb-1">領収書</p>
        <p className="text-sm text-ink-secondary">まだ領収書は追加されていません</p>
        <button
          type="button"
          onClick={() => pushToast("この機能は近日公開予定です")}
          className="mt-3 flex items-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 px-4 hover:border-gold/40 hover:text-gold transition-colors"
        >
          <Plus size={14} />
          領収書を追加
        </button>
      </div>
      <ToastStack toasts={toasts} />
    </section>
  );
}
