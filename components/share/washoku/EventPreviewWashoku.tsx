import { MapPin, Users, Wallet, Building2 } from "lucide-react";
import { WashokuPaperCard } from "./WashokuPaperCard";
import type { PDFPaymentInfo } from "@/lib/pdf/components";
import type { HistoryPayload, HistoryType } from "@/lib/history/types";

// Participant-facing counterpart to components/share/EventPreview.tsx —
// kept as a separate component (not a prop-toggle on EventPreview) so this
// screen's washoku redesign can never regress the operator's
// /history/[id] page, which renders the original EventPreview directly.
function hasPaymentInfo(payment?: PDFPaymentInfo): payment is PDFPaymentInfo {
  if (!payment) return false;
  return Boolean(payment.bankAccountNumber || payment.paypayId || payment.linePayId || payment.memo);
}

const KANJI_BY_TYPE: Record<HistoryType, string> = {
  nomikai: "宴",
  travel: "旅",
};

export function EventPreviewWashoku({
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
    <WashokuPaperCard>
      <div className="text-center mb-8">
        <p className="font-serif text-6xl font-black text-washoku-red leading-none">
          {KANJI_BY_TYPE[type]}
        </p>
        <div className="mt-4 border-t border-b border-washoku-brass-soft py-3">
          <h1 className="font-serif text-xl sm:text-2xl font-bold">{title}</h1>
          {eventDate && <p className="text-sm text-washoku-ink-muted mt-1">{eventDate}</p>}
        </div>
      </div>

      {type === "nomikai" && payload.kind === "nomikai" && (
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-xs font-serif text-washoku-brass mb-2 flex items-center gap-1.5">
              <MapPin size={13} />
              会場
            </p>
            <p className="font-serif text-lg font-medium">{payload.pdf.shop.name}</p>
            <p className="text-sm text-washoku-ink-muted mt-0.5">{payload.pdf.shop.address}</p>
            {payload.pdf.shop.openHours && (
              <p className="text-xs text-washoku-ink-muted mt-1">{payload.pdf.shop.openHours}</p>
            )}
          </div>

          <div>
            <p className="text-xs font-serif text-washoku-brass mb-2 flex items-center gap-1.5">
              <Users size={13} />
              参加者・お支払い
            </p>
            <div className="border-t border-washoku-brass-soft">
              {payload.pdf.participants.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-center justify-between text-sm py-2 border-b border-washoku-brass-soft"
                >
                  <span>{p.name}</span>
                  <span className="font-serif font-semibold">¥{p.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="font-serif font-semibold">合計</span>
                <span className="font-serif font-black text-washoku-red text-lg">
                  ¥{payload.pdf.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {hasPaymentInfo(payload.pdf.payment) && (
            <div>
              <p className="text-xs font-serif text-washoku-brass mb-2 flex items-center gap-1.5">
                <Wallet size={13} />
                集金方法
              </p>
              <div className="flex flex-col gap-1.5 text-sm text-washoku-ink-muted">
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
                {payload.pdf.payment.memo && <p className="text-xs">{payload.pdf.payment.memo}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {type === "travel" && payload.kind === "travel" && (
        <div className="flex flex-col gap-8">
          <p className="text-center text-sm text-washoku-ink-muted flex items-center justify-center gap-2">
            <MapPin size={14} />
            {payload.pdf.destination}・{payload.pdf.nights}泊{payload.pdf.days}日
          </p>

          <div>
            <p className="text-xs font-serif text-washoku-brass mb-2 flex items-center gap-1.5">
              <Building2 size={13} />
              宿泊先
            </p>
            <p className="font-serif text-lg font-medium">{payload.pdf.hotelName}</p>
          </div>

          <div>
            <p className="text-xs font-serif text-washoku-brass mb-2 flex items-center gap-1.5">
              <Users size={13} />
              参加者・お支払い
            </p>
            <div className="border-t border-washoku-brass-soft">
              {payload.pdf.participants.map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-center justify-between text-sm py-2 border-b border-washoku-brass-soft"
                >
                  <span>{p.name}</span>
                  <span className="font-serif font-semibold">¥{p.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3">
                <span className="font-serif font-semibold">合計</span>
                <span className="font-serif font-black text-washoku-red text-lg">
                  ¥{payload.pdf.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-serif text-washoku-brass mb-2">日程</p>
            <div className="flex flex-col gap-3">
              {payload.pdf.itinerary.map((day) => (
                <div key={day.day} className="border-t border-washoku-brass-soft pt-2">
                  <p className="text-xs font-serif text-washoku-brass mb-1">{day.day}日目</p>
                  <p className="text-sm text-washoku-ink-muted leading-relaxed">{day.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WashokuPaperCard>
  );
}
