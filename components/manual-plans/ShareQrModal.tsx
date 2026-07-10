"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { generateQRDataUrl } from "@/lib/share/qr";

export default function ShareQrModal({
  open,
  onClose,
  url,
  title,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    generateQRDataUrl(url).then((d) => {
      if (!cancelled) setDataUrl(d);
    });
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-sm bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="font-serif font-bold text-lg text-ink mb-5">QRコードで共有</h2>

          <div className="flex flex-col items-center gap-4">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="QRコード"
                width={200}
                height={200}
                className="rounded-xl border border-gold/15"
              />
            ) : (
              <div style={{ width: 200, height: 200 }} className="rounded-xl bg-surface animate-pulse" />
            )}

            <p className="text-xs text-ink-muted text-center break-all">{url}</p>

            {dataUrl && (
              <a
                href={dataUrl}
                download={`Kanjii_${title}_QR.png`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
              >
                <Download size={16} />
                QRコードをダウンロード
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
