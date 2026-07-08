import { Landmark, Smartphone } from "lucide-react";
import type { PaymentSettings } from "@/lib/settings/types";

export default function PaymentMethodCard({ settings }: { settings: PaymentSettings }) {
  const hasBank = Boolean(settings.bankAccountNumber);
  const hasDigital = Boolean(settings.paypayId || settings.linePayId);

  if (!hasBank && !hasDigital) {
    return (
      <div className="rounded-xl border border-gold/15 bg-surface-tertiary p-4 text-sm text-ink-muted">
        まだ集金方法が設定されていません。
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gold/15 bg-surface-tertiary p-4 flex flex-col gap-3">
      {hasBank && (
        <div className="flex items-start gap-2.5">
          <Landmark size={16} className="text-gold shrink-0 mt-0.5" />
          <div className="text-sm text-ink-secondary">
            <p>
              {[settings.bankName, settings.bankBranch, settings.bankAccountType, settings.bankAccountNumber]
                .filter(Boolean)
                .join(" ")}
            </p>
            {settings.bankAccountHolder && <p className="text-ink-muted text-xs mt-0.5">{settings.bankAccountHolder}</p>}
          </div>
        </div>
      )}
      {hasDigital && (
        <div className="flex items-start gap-2.5">
          <Smartphone size={16} className="text-gold shrink-0 mt-0.5" />
          <div className="text-sm text-ink-secondary flex flex-col gap-0.5">
            {settings.paypayId && <p>PayPay: {settings.paypayId}</p>}
            {settings.linePayId && <p>LINE Pay: {settings.linePayId}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
