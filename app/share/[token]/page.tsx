import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";
import Logo from "@/components/shared/Logo";
import GoldButton from "@/components/shared/GoldButton";
import EventPreview from "@/components/share/EventPreview";
import PDFPreviewButton from "@/components/pdf/ClientPDFPreviewButton";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HistoryPayload, HistoryType } from "@/lib/history/types";

export default async function SharePage({ params }: { params: { token: string } }) {
  const supabase = createAdminClient();

  const { data: shareToken } = await supabase
    .from("share_tokens")
    .select("*")
    .eq("token", params.token)
    .maybeSingle();

  const expired = Boolean(
    shareToken?.expires_at && new Date(shareToken.expires_at) < new Date()
  );

  const { data: history } =
    shareToken && !expired
      ? await supabase
          .from("history")
          .select("*")
          .eq("id", shareToken.history_id)
          .maybeSingle()
      : { data: null };

  if (shareToken && !expired && history) {
    await supabase
      .from("share_tokens")
      .update({ view_count: (shareToken.view_count ?? 0) + 1 })
      .eq("token", params.token);
  }

  return (
    <div className="min-h-screen ink-wash px-4 py-10 flex flex-col items-center">
      <Logo size="md" href="/" />

      {!shareToken || (!history && !expired) ? (
        <div className="mt-10 w-full max-w-sm text-center rounded-3xl bg-surface-tertiary shadow-warm p-8">
          <p className="text-ink-secondary">このリンクは見つかりませんでした。</p>
        </div>
      ) : expired ? (
        <div className="mt-10 w-full max-w-sm text-center rounded-2xl border border-vermilion/20 bg-vermilion/5 p-8 flex flex-col items-center gap-3">
          <Clock className="text-vermilion" size={32} />
          <p className="text-ink-secondary">このリンクは期限切れです。</p>
          <p className="text-xs text-ink-muted">幹事の方に新しいリンクを依頼してください。</p>
        </div>
      ) : (
        <div className="w-full max-w-lg mt-8 flex flex-col gap-8">
          <p className="text-center text-sm text-ink-secondary">
            幹事さんから招待されました
          </p>

          <EventPreview
            type={history!.type as HistoryType}
            title={history!.title}
            eventDate={history!.event_date}
            payload={history!.payload as HistoryPayload}
          />

          <div className="flex flex-col gap-3">
            {(history!.payload as HistoryPayload).kind === "nomikai" ? (
              <PDFPreviewButton
                kind="nomikai"
                data={(history!.payload as HistoryPayload & { kind: "nomikai" }).pdf}
                filename={`KanjiLabo_${history!.title}.pdf`}
              />
            ) : (
              <PDFPreviewButton
                kind="travel"
                data={(history!.payload as HistoryPayload & { kind: "travel" }).pdf}
                filename={`KanjiLabo_${history!.title}.pdf`}
              />
            )}

            <GoldButton href="/signup" icon={Sparkles}>
              幹事ラボで自分も幹事してみる
            </GoldButton>
          </div>
        </div>
      )}

      <Link href="/" className="mt-10 text-xs text-ink-muted hover:text-gold transition-colors">
        幹事ラボ トップへ
      </Link>
    </div>
  );
}
