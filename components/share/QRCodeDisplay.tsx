"use client";

import { useEffect, useState } from "react";
import { generateQRDataUrl } from "@/lib/share/qr";

export default function QRCodeDisplay({
  value,
  size = 180,
}: {
  value: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateQRDataUrl(value).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-surface-tertiary animate-pulse"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="QRコード"
      width={size}
      height={size}
      className="rounded-xl border border-gold/15"
    />
  );
}
