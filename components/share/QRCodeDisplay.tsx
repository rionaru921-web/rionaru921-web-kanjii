"use client";

import { useEffect, useState } from "react";
import { generateStyledQRDataUrl } from "@/lib/share/qrStyled";

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
    generateStyledQRDataUrl(value, size * 2).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
