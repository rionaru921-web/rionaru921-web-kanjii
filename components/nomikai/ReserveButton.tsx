"use client";

import { ExternalLink } from "lucide-react";

// TODO(P5): wire this up to a Supabase table (e.g. reserve_clicks) once the
// history/analytics schema exists. Kept as a no-op for now so the click
// itself is never blocked on that being ready.
function trackReserveClick(shopId: string) {
  void shopId;
}

export default function ReserveButton({
  shopUrl,
  shopId,
}: {
  shopUrl: string;
  shopId: string;
}) {
  return (
    <a
      href={shopUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackReserveClick(shopId)}
      className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-4 text-base hover:brightness-110 transition-all shadow-warm-hover"
    >
      <ExternalLink size={18} />
      ホットペッパーで予約する
    </a>
  );
}
