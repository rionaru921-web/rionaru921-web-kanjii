import Link from "next/link";
import { Clock, MapPin, Wallet, FileText, CalendarPlus, Sparkles, EyeOff } from "lucide-react";
import Logo from "@/components/shared/Logo";
import GoldButton from "@/components/shared/GoldButton";
import AttendanceButtons from "@/components/manual-plans/AttendanceButtons";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateRange, PAYMENT_METHOD_LABELS } from "@/lib/manual-plans/format";
import { yen } from "@/lib/pdf/components";
import type { ManualPlan } from "@/lib/manual-plans/types";

// Without this, Next's fetch-based Data Cache can treat this dynamic-segment
// page as staticly cacheable indefinitely (no generateStaticParams + a
// service-role client that never touches cookies/headers gives Next no
// other dynamic signal), so an attendee could keep seeing a stale snapshot
// of the plan after the organizer edits it. Forcing dynamic rendering trades
// that indefinite staleness for a fresh row on every request.
export const dynamic = "force-dynamic";

// Public, unauthenticated view. Deliberately at /share/plan/[token] rather
// than /share/[token] — that path is already used by the existing
// history-sharing flow (app/share/[token]/page.tsx), which this task must
// not touch. Uses the service-role admin client (bypasses RLS) instead of a
// public "using (true)" SELECT policy on manual_plans, matching the same
// pattern the history share flow already uses to avoid exposing every
// user's plan data via a direct table read.
function buildGoogleCalendarUrl(plan: ManualPlan): string {
  if (!plan.event_date) return "";
  const start = new Date(plan.event_date);
  const end = plan.end_date ? new Date(plan.end_date) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const toGCalDate = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: plan.title,
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    location: plan.venue_address || plan.venue_name || "",
    details: plan.memo || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function SharePlanPage({ params }: { params: { token: string } }) {
  const supabase = createAdminClient();

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("share_token", params.token)
    .maybeSingle();

  const typedPlan = plan as ManualPlan | null;
  const gcalUrl = typedPlan ? buildGoogleCalendarUrl(typedPlan) : "";
  const mapLink =
    typedPlan?.venue_map_url ||
    (typedPlan?.venue_address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(typedPlan.venue_address)}`
      : null);

  return (
    <div className="min-h-screen ink-wash px-4 py-10 flex flex-col items-center">
      <Logo size="md" href="/" />

      {!typedPlan ? (
        <div className="mt-10 w-full max-w-sm text-center rounded-3xl bg-surface-tertiary shadow-warm p-8">
          <p className="text-ink-secondary">このリンクは見つかりませんでした。</p>
        </div>
      ) : !typedPlan.is_shared ? (
        <div className="mt-10 w-full max-w-sm text-center rounded-3xl bg-surface-tertiary shadow-warm p-8 flex flex-col items-center gap-3">
          <EyeOff className="text-ink-muted" size={32} />
          <h1 className="font-serif font-bold text-lg text-ink">このプランはまだ共有されていません</h1>
          <p className="text-ink-secondary text-sm">作成者に確認してください</p>
        </div>
      ) : (
        <div className="w-full max-w-lg mt-8 flex flex-col gap-6">
          <p className="text-center text-sm text-ink-secondary">幹事さんから招待されました</p>

          <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 flex flex-col gap-5">
            <h1 className="font-serif font-bold text-2xl text-ink text-center">{typedPlan.title}</h1>

            <div className="flex items-start gap-3">
              <Clock className="text-gold shrink-0" size={18} />
              <p className="text-sm text-ink">{formatDateRange(typedPlan.event_date, typedPlan.end_date)}</p>
            </div>

            {(typedPlan.venue_name || typedPlan.venue_address) && (
              <div className="flex items-start gap-3">
                <MapPin className="text-gold shrink-0" size={18} />
                <div>
                  {typedPlan.venue_name && (
                    <p className="text-sm text-ink font-semibold">{typedPlan.venue_name}</p>
                  )}
                  {typedPlan.venue_address && (
                    <p className="text-sm text-ink-secondary">{typedPlan.venue_address}</p>
                  )}
                  {mapLink && (
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gold hover:text-gold-deep transition-colors mt-1 inline-block"
                    >
                      地図を見る →
                    </a>
                  )}
                </div>
              </div>
            )}

            {typedPlan.fee_amount != null && (
              <div className="flex items-start gap-3">
                <Wallet className="text-gold shrink-0" size={18} />
                <div>
                  <p className="text-sm font-display-num font-black text-ink">{yen(typedPlan.fee_amount)}</p>
                  {typedPlan.payment_methods.length > 0 && (
                    <p className="text-xs text-ink-secondary mt-0.5">
                      {typedPlan.payment_methods.map((m) => PAYMENT_METHOD_LABELS[m] ?? m).join(" / ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {typedPlan.memo && (
              <div className="flex items-start gap-3">
                <FileText className="text-gold shrink-0" size={18} />
                <p className="text-sm text-ink-secondary whitespace-pre-wrap">{typedPlan.memo}</p>
              </div>
            )}
          </div>

          <AttendanceButtons />

          {gcalUrl && (
            <a
              href={gcalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-gold/30 text-gold font-semibold text-sm py-3 hover:bg-gold/5 transition-colors"
            >
              <CalendarPlus size={16} />
              Googleカレンダーに追加
            </a>
          )}

          <GoldButton href="/signup" icon={Sparkles}>
            Kanjiiで自分も幹事してみる
          </GoldButton>
        </div>
      )}

      <Link href="/" className="mt-10 text-xs text-ink-muted hover:text-gold transition-colors">
        Kanjii トップへ
      </Link>
    </div>
  );
}
