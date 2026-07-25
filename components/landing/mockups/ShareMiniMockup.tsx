"use client";

import { motion } from "framer-motion";
import { QrCode, Share2 } from "lucide-react";

// Compact companion to mockups/ShareMockup.tsx (Wave 9-C) for the how-to
// guide's step 2 — drops the LINE/メール row to stay lean.
export default function ShareMiniMockup() {
  return (
    <div className="rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover p-5 max-w-sm mx-auto">
      <div className="mb-3 flex items-center gap-2 border-b border-gold/10 pb-2.5">
        <Share2 size={14} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">共有オプション</span>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4 }}
        className="flex gap-3"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-surface-secondary">
          <QrCode size={32} className="text-gold" />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          <div className="rounded-lg border border-gold/20 bg-surface-secondary px-2.5 py-1.5 text-[11px] text-ink-secondary truncate">
            kanji-lab.com/share/8f2a91
          </div>
          <div className="text-[10px] text-ink-muted">PDF (A4) 出力対応</div>
        </div>
      </motion.div>
    </div>
  );
}
