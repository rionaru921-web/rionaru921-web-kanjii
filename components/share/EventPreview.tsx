import { MapPin, Users, Wallet, Building2, Calendar } from "lucide-react";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";
import type { PDFPaymentInfo } from "@/lib/pdf/components";
import type { HistoryPayload, HistoryType } from "@/lib/history/types";

// Mirrors lib/pdf/components.tsx's hasPaymentInfo. Re-implemented locally
// (rather than imported) because that module also exports React components
// built on @react-pdf/renderer's browser-only APIs, which must not be
// evaluated during this page's server render.
function hasPaymentInfo(payment?: PDFPaymentInfo): payment is PDFPaymentInfo {
  if (!payment) return false;
  return Boolean(payment.bankAccountNumber || payment.paypayId || payment.linePayId || payment.memo);
}

export default function EventPreview({
  type,
  title,
  eventDate,
  payload,
}: {
  type: HistoryType;
  title: string;
  eventDate: string | null;
  payload: HistoryPayload;
}) {
  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 sm:p-8">
      <MizuhikiDivider className="mb-5" />
      <h1 className="font-serif font-bold text-2xl text-gold-gradient text-center mb-1">
        {title}
      </h1>
      {eventDate && (
        <p className="text-sm text-ink-secondary text-center flex items-center justify-center gap-1.5">
          <Calendar size={13} />
          {eventDate}
        </p>
      )}
      <MizuhikiDivider className="mt-5 mb-6" />

      {type === "nomikai" && payload.kind === "nomikai" && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold text-gold mb-2">会場</p>
            <div className="rounded-xl border border-gold/15 bg-surface-tertiary p-4">
              <p className="font-serif font-bold text-ink mb-1">{payload.pdf.shop.name}</p>
              <p className="text-sm text-ink-secondary flex items-center gap-1.5">
                <MapPin size={13} />
                {payload.pdf.shop.address}
              </p>
              {payload.pdf.shop.openHours && (
                <p className="text-xs text-ink-muted mt-1">{payload.pdf.shop.openHours}</p>
              )}
              {payload.pdf.shop.mapUrl && (
                <div className="mt-3 rounded-lg overflow-hidden h-40 border border-gold/10">
                  <iframe
                    title="地図"
                    className="w-full h-full"
                    loading="lazy"
                    src={payload.pdf.shop.mapUrl}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gold mb-2 flex items-center gap-1.5">
              <Users size={13} />
              参加者・お支払い
            </p>
            <div className="rounded-xl border border-gold/15 bg-surface-tertiary p-4">
              {payload.pdf.participants.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-gold/10 last:border-0"
                >
                  <span className="text-ink-secondary">{p.name}</span>
                  <span className="font-bold text-ink">¥{p.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-gold/15">
                <span className="font-semibold text-ink">合計</span>
                <span className="font-serif font-bold text-gold-gradient text-lg">
                  ¥{payload.pdf.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {hasPaymentInfo(payload.pdf.payment) && (
            <div>
              <p className="text-xs font-semibold text-gold mb-2 flex items-center gap-1.5">
                <Wallet size={13} />
                集金方法
              </p>
              <div className="rounded-xl border border-gold/15 bg-surface-tertiary p-4 flex flex-col gap-1.5 text-sm text-ink-secondary">
                {payload.pdf.payment.bankAccountNumber && (
                  <p>
                    {[
                      payload.pdf.payment.bankName,
                      payload.pdf.payment.bankBranch,
                      payload.pdf.payment.bankAccountType,
                      payload.pdf.payment.bankAccountNumber,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                )}
                {payload.pdf.payment.bankAccountHolder && <p>{payload.pdf.payment.bankAccountHolder}</p>}
                {payload.pdf.payment.paypayId && <p>PayPay: {payload.pdf.payment.paypayId}</p>}
                {payload.pdf.payment.linePayId && <p>LINE Pay: {payload.pdf.payment.linePayId}</p>}
                {payload.pdf.payment.memo && (
                  <p className="text-xs text-ink-muted">{payload.pdf.payment.memo}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {type === "travel" && payload.kind === "travel" && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-sm text-ink-secondary justify-center">
            <MapPin size={14} />
            {payload.pdf.destination}・{payload.pdf.nights}泊{payload.pdf.days}日
          </div>

          <div>
            <p className="text-xs font-semibold text-gold mb-2 flex items-center gap-1.5">
              <Building2 size={13} />
              宿泊先
            </p>
            <div className="rounded-xl border border-gold/15 bg-surface-tertiary p-4">
              <p className="font-serif font-bold text-ink">{payload.pdf.hotelName}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gold mb-2 flex items-center gap-1.5">
              <Users size={13} />
              参加者・お支払い
            </p>
            <div className="rounded-xl border border-gold/15 bg-surface-tertiary p-4">
              {payload.pdf.participants.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-gold/10 last:border-0"
                >
                  <span className="text-ink-secondary">{p.name}</span>
                  <span className="font-bold text-ink">¥{p.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-gold/15">
                <span className="font-semibold text-ink">合計</span>
                <span className="font-serif font-bold text-gold-gradient text-lg">
                  ¥{payload.pdf.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gold mb-2">日程</p>
            <div className="flex flex-col gap-2">
              {payload.pdf.itinerary.map((day) => (
                <div key={day.day} className="rounded-xl border border-gold/15 bg-surface-tertiary p-3">
                  <p className="text-xs font-semibold text-gold mb-1">{day.day}日目</p>
                  <p className="text-sm text-ink-secondary leading-relaxed">{day.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
