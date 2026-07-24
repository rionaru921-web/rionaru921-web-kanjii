import { Clock } from "lucide-react";
import { WashokuShell } from "@/components/share/washoku/WashokuShell";
import { WashokuPaperCard } from "@/components/share/washoku/WashokuPaperCard";
import { WashokuCTA } from "@/components/share/washoku/WashokuCTA";
import { EventPreviewWashoku } from "@/components/share/washoku/EventPreviewWashoku";
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

  if (!shareToken || (!history && !expired)) {
    return (
      <WashokuShell eyebrow="">
        <WashokuPaperCard>
          <p className="text-center text-washoku-ink-muted">このリンクは見つかりませんでした。</p>
        </WashokuPaperCard>
      </WashokuShell>
    );
  }

  if (expired) {
    return (
      <WashokuShell eyebrow="">
        <div className="text-center rounded-lg border border-washoku-red-soft bg-washoku-red-soft p-8 flex flex-col items-center gap-3">
          <Clock className="text-washoku-red" size={32} />
          <p className="text-washoku-paper">このリンクは期限切れです。</p>
          <p className="text-xs text-washoku-paper-faint">幹事の方に新しいリンクを依頼してください。</p>
        </div>
      </WashokuShell>
    );
  }

  return (
    <WashokuShell>
      <EventPreviewWashoku
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

        <WashokuCTA>幹事ラボで自分も幹事してみる</WashokuCTA>
      </div>
    </WashokuShell>
  );
}
