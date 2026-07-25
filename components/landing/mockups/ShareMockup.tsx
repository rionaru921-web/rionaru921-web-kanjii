"use client";

import { motion } from "framer-motion";
import { Copy, FileText, QrCode, Share2 } from "lucide-react";

// Mirrors ShareQrModal.tsx (QR generation), PDFPreviewButton.tsx, and
// ShareButtons.tsx — including its real Japanese button labels (LINE /
// メール), not translated placeholders.
export default function ShareMockup() {
  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-6 max-w-md mx-auto">
      <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
        <Share2 size={16} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">共有オプション</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
        className="flex gap-3"
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-surface-secondary">
          <QrCode size={40} className="text-gold" />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-gold/20 bg-surface-secondary px-2.5 py-1.5 text-[11px] text-ink-secondary">
            <span className="truncate">kanji-lab.com/share/8f2a91</span>
          </div>
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-[11px] text-gold">
            <FileText size={11} />
            PDF (A4) 出力対応
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex gap-2 border-t border-gold/10 pt-3">
        {["LINE", "メール", "URLをコピー"].map((label, i) => (
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
            className="inline-flex items-center gap-1 rounded-full border border-gold/20 px-2.5 py-1 text-[11px] text-ink-secondary"
          >
            {label === "URLをコピー" && <Copy size={11} />}
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
