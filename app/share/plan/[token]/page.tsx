import Link from "next/link";
import { Clock, MapPin, Wallet, FileText, CalendarPlus, Sparkles, MessageCircle } from "lucide-react";
import Logo from "@/components/shared/Logo";
import GoldButton from "@/components/shared/GoldButton";
import AttendanceForm from "@/components/share/AttendanceForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateRange, PAYMENT_METHOD_LABELS } from "@/lib/manual-plans/format";
import { yen } from "@/lib/pdf/components";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";

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

// Lets an attendee who received this share link forward it to someone else
// via LINE, without needing to know/copy the URL themselves.
function buildLineShareUrl(plan: ManualPlan, shareUrl: string): string {
  const text = `幹事さんからのお知らせです\n\n${plan.title}\n${shareUrl}`;
  return `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
}

export default async function SharePlanPage({ params }: { params: { token: string } }) {
  const supabase = createAdminClient();

  const { data: plan } = await supabase
    .from("manual_plans")
    .select("*")
    .eq("share_token", params.token)
    .maybeSingle();

  const typedPlan = plan as ManualPlan | null;

  const { data: members } = typedPlan
    ? await supabase
        .from("manual_plan_members")
        .select("*")
        .eq("plan_id", typedPlan.id)
        .order("created_at", { ascending: true })
    : { data: [] };
  const typedMembers = (members ?? []) as ManualPlanMember[];

  const gcalUrl = typedPlan ? buildGoogleCalendarUrl(typedPlan) : "";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const lineUrl = typedPlan ? buildLineShareUrl(typedPlan, `${baseUrl}/share/plan/${params.token}`) : "";
  const icsUrl = typedPlan ? `/api/share/plan/${params.token}/ics` : "";
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

          <AttendanceForm shareToken={params.token} members={typedMembers} />

          {lineUrl && (
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-[#06C755]/40 text-[#06C755] font-semibold text-sm py-3 hover:bg-[#06C755]/5 transition-colors"
            >
              <MessageCircle size={16} />
              LINEで共有
            </a>
          )}

          {icsUrl && (
            <a
              href={icsUrl}
              className="flex items-center justify-center gap-2 rounded-full border border-blue-200 text-blue-600 font-semibold text-sm py-3 hover:bg-blue-50 transition-colors"
            >
              <CalendarPlus size={16} />
              カレンダーに追加(.ics)
            </a>
          )}

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
