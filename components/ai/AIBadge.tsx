import { Sparkles } from "lucide-react";

export default function AIBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gold-gradient text-white text-[11px] font-bold px-2.5 py-1 ${className}`}
    >
      <Sparkles size={12} />
      AI推薦
    </span>
  );
}
