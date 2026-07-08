import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Logo from "@/components/shared/Logo";

export default function LegalHeader() {
  return (
    <header className="border-b border-gold/10 bg-surface-tertiary/90 backdrop-blur-md sticky top-0 z-20 px-4 py-3.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Logo size="sm" />
        <Link
          href="/"
          className="flex items-center gap-1 text-xs text-ink-secondary hover:text-gold transition-colors"
        >
          <ChevronLeft size={14} />
          ホームに戻る
        </Link>
      </div>
    </header>
  );
}
