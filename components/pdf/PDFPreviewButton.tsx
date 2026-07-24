"use client";

import { useState } from "react";
import { FileDown, Loader2, AlertTriangle } from "lucide-react";
import { generateNomikaiPDF, generateTravelPDF, downloadPDF } from "@/lib/pdf/generate";
import { generateQRDataUrl } from "@/lib/share/qr";
import type { NomikaiPDFProps } from "@/lib/pdf/templates/NomikaiPDF";
import type { TravelPDFProps } from "@/lib/pdf/templates/TravelPDF";

type PDFPreviewButtonProps =
  | { kind: "nomikai"; data: Omit<NomikaiPDFProps, "qrDataUrl">; filename: string }
  | { kind: "travel"; data: TravelPDFProps; filename: string };

export default function PDFPreviewButton(props: PDFPreviewButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      let blob: Blob;
      if (props.kind === "nomikai") {
        const qrDataUrl = await generateQRDataUrl(props.data.shop.mapUrl);
        blob = await generateNomikaiPDF({ ...props.data, qrDataUrl });
      } else {
        blob = await generateTravelPDF(props.data);
      }
      downloadPDF(blob, props.filename);
    } catch (err) {
      console.error("[PDFPreviewButton] PDF generation failed:", err);
      setError(err instanceof Error ? err.message : "PDFの生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 rounded-full border border-gold text-gold font-semibold text-sm py-2.5 hover:bg-gold/10 transition-colors disabled:opacity-70"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        {loading ? "PDF生成中..." : "PDF出力"}
      </button>

      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-x-0 top-full mt-2 z-10 flex items-center justify-center gap-2 rounded-xl bg-surface-tertiary shadow-warm-hover px-3 py-2.5 text-xs text-ink-secondary"
        >
          <Loader2 size={13} className="animate-spin text-gold shrink-0" />
          PDFを作成しています。しばらくお待ちください...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1.5 mt-1.5 text-[11px] text-vermilion-text">
          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
