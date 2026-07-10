import { Globe, FileText } from "lucide-react";

export default function ShareStatusBadge({ isShared }: { isShared: boolean }) {
  return isShared ? (
    <span className="inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2.5 py-1 border text-gold bg-surface-tertiary border-gold/30">
      <Globe size={12} />
      共有中
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2.5 py-1 border text-ink/60 bg-white border-ink/20">
      <FileText size={12} />
      下書き
    </span>
  );
}
