import Link from "next/link";

export default function Logo({
  size = "md",
  href = "/",
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
}) {
  const dims = {
    sm: { icon: 26, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 44, text: "text-3xl" },
  }[size];

  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0">
      <svg
        width={dims.icon}
        height={dims.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="kanjii-logo-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C4A56B" />
            <stop offset="55%" stopColor="#B8935A" />
            <stop offset="100%" stopColor="#A67F48" />
          </linearGradient>
        </defs>
        <line x1="20" y1="2" x2="20" y2="7" stroke="url(#kanjii-logo-gold)" strokeWidth="1.5" />
        <ellipse
          cx="20"
          cy="21"
          rx="14"
          ry="15"
          fill="url(#kanjii-logo-gold)"
          fillOpacity="0.14"
          stroke="url(#kanjii-logo-gold)"
          strokeWidth="1.6"
        />
        <path
          d="M7 15 H33 M6.3 21 H33.7 M7 27 H33"
          stroke="url(#kanjii-logo-gold)"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        <rect x="17" y="6" width="6" height="4" rx="1" fill="url(#kanjii-logo-gold)" />
        <rect x="17" y="32" width="6" height="4" rx="1" fill="url(#kanjii-logo-gold)" />
        <line x1="20" y1="36" x2="20" y2="39" stroke="url(#kanjii-logo-gold)" strokeWidth="1.5" />
      </svg>
      <span className={`font-serif font-bold tracking-wide text-gold-gradient ${dims.text}`}>
        幹事ラボ
      </span>
    </Link>
  );
}
