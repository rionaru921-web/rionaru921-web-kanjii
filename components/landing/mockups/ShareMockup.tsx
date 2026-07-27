"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, FileText, QrCode, Share2 } from "lucide-react";
import type { MockupProps } from "./mockupTypes";

type Tab = "qr" | "pdf" | "url";
const TABS: { key: Tab; label: string }[] = [
  { key: "qr", label: "QR" },
  { key: "pdf", label: "PDF" },
  { key: "url", label: "URL" },
];

const CONTAINER_SIZE = {
  sm: "max-w-sm p-5",
  md: "max-w-md p-6",
  lg: "max-w-xl p-8",
};

const SHARE_URL = "kanji-lab.com/share/8f2a91";

// Mirrors ShareQrModal.tsx (QR generation), PDFPreviewButton.tsx, and
// ShareButtons.tsx — including its real Japanese button labels (LINE /
// メール), not translated placeholders.
export default function ShareMockup({ size = "md", autoPlay = true, onInteraction }: MockupProps = {}) {
  const [tab, setTab] = useState<Tab>("qr");
  const [copied, setCopied] = useState(false);

  function selectTab(next: Tab) {
    setTab(next);
    onInteraction?.({ type: "tab-select", label: next });
  }

  function copyUrl() {
    setCopied(true);
    onInteraction?.({ type: "copy-url" });
    setTimeout(() => setCopied(false), 2000);
  }

  const entrance = autoPlay
    ? {
        initial: { opacity: 0, scale: 0.95 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.4 },
      }
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.4 },
      };

  return (
    <div className={`relative rounded-2xl border border-gold/20 bg-surface-tertiary shadow-warm-hover mx-auto ${CONTAINER_SIZE[size]}`}>
      <div className="mb-4 flex items-center gap-2 border-b border-gold/10 pb-3">
        <Share2 size={16} className="text-gold" />
        <span className="font-serif text-xs text-ink-muted">共有オプション</span>
      </div>

      <div className="mb-3 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTab(t.key)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
              tab === t.key ? "border-gold bg-gold/10 text-ink" : "border-gold/15 text-ink-secondary hover:border-gold/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "qr" && (
          <motion.div key="qr" {...entrance} className="flex gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-surface-secondary">
              <QrCode size={40} className="text-gold" />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-gold/20 bg-surface-secondary px-2.5 py-1.5 text-[11px] text-ink-secondary">
                <span className="truncate">{SHARE_URL}</span>
              </div>
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-[11px] text-gold">
                <FileText size={11} />
                PDF (A4) 出力対応
              </div>
            </div>
          </motion.div>
        )}

        {tab === "pdf" && (
          <motion.div key="pdf" {...entrance} className="flex gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-surface-secondary">
              <FileText size={40} className="text-gold" />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-1.5">
              <p className="text-xs text-ink">A4サイズで印刷用PDFを生成</p>
              <div className="h-1.5 rounded-full bg-gold/10 w-full" />
              <div className="h-1.5 rounded-full bg-gold/10 w-3/4" />
            </div>
          </motion.div>
        )}

        {tab === "url" && (
          <motion.div key="url" {...entrance} className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-gold/20 bg-surface-secondary px-2.5 py-1.5 text-[11px] text-ink-secondary">
              <span className="truncate flex-1">https://{SHARE_URL}</span>
              <button
                type="button"
                onClick={copyUrl}
                className="flex shrink-0 items-center gap-1 rounded-full bg-gold-gradient px-2.5 py-1 text-[10px] font-semibold text-white"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "コピー済み" : "コピー"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex gap-2 border-t border-gold/10 pt-3">
        {["LINE", "メール", "URLをコピー"].map((label, i) => (
          <motion.button
            key={label}
            type="button"
            onClick={label === "URLをコピー" ? copyUrl : undefined}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
            className="inline-flex items-center gap-1 rounded-full border border-gold/20 px-2.5 py-1 text-[11px] text-ink-secondary hover:border-gold/40 transition-colors"
          >
            {label === "URLをコピー" && <Copy size={11} />}
            {label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1.5 text-[11px] text-white shadow-warm-hover"
          >
            コピーしました
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
