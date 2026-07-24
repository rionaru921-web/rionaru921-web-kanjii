import Link from "next/link";
import { Sparkles } from "lucide-react";

// Share-screen-only signup CTA. Deliberately not the shared GoldButton
// component — that's styled for the white operator theme and reused across
// the dashboard, so reusing it here would either look wrong on the dark
// washoku background or risk someone "fixing" it for one theme and
// breaking the other.
export function WashokuCTA({ href = "/signup", children }: { href?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-washoku-ink shadow-lg transition-transform hover:scale-[1.02]"
      style={{
        background:
          "linear-gradient(135deg, var(--washoku-brass-bright) 0%, var(--washoku-brass) 60%, var(--washoku-red) 100%)",
      }}
    >
      <Sparkles size={16} />
      {children}
    </Link>
  );
}
