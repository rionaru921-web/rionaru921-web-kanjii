import { Check } from "lucide-react";

export default function SectionCompleteBadge({ filled }: { filled: boolean }) {
  if (!filled) return null;

  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-gold" aria-label="入力済み">
      <Check size={12} strokeWidth={3} />
    </span>
  );
}
