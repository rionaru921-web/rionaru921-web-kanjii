"use client";

interface AdSlotProps {
  slot: "sidebar" | "in-content" | "footer";
  className?: string;
}

// Placeholder ad slot. Renders nothing until Google AdSense approval lands
// and NEXT_PUBLIC_ADSENSE_ENABLED is flipped to "true" — keeps the mount
// points wired into pages now without showing anything broken/empty in the
// meantime.
export function AdSlot({ slot, className = "" }: AdSlotProps) {
  const adSenseEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

  if (!adSenseEnabled) {
    return null;
  }

  return (
    <div className={`ad-slot ad-slot-${slot} ${className}`}>
      {/* AdSense承認後、ここに <ins className="adsbygoogle" ... /> タグと
          adsbygoogle.push({}) の呼び出しを追加する */}
    </div>
  );
}
