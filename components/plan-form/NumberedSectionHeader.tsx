import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

const CIRCLED_NUMERALS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

interface NumberedSectionHeaderProps {
  number: number;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  filled?: boolean;
}

export default function NumberedSectionHeader({
  number,
  icon: Icon,
  title,
  subtitle,
  filled = false,
}: NumberedSectionHeaderProps) {
  return (
    <span className="flex items-center gap-2.5 sm:gap-3">
      <span className="relative shrink-0">
        <span
          className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gold-gradient font-serif font-bold text-white text-base sm:text-xl"
          aria-hidden
        >
          {CIRCLED_NUMERALS[number - 1] ?? number}
        </span>
        {filled && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sage text-white ring-2 ring-surface-tertiary"
            aria-label="入力済み"
          >
            <Check size={10} strokeWidth={3} />
          </span>
        )}
      </span>
      <span className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-gold/10">
        <Icon size={18} className="text-gold" />
      </span>
      <span className="flex flex-col text-left">
        <span className="font-serif font-bold text-ink">{title}</span>
        {subtitle && <span className="text-xs text-ink-muted">{subtitle}</span>}
      </span>
    </span>
  );
}
