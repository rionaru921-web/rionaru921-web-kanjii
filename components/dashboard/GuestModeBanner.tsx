import Link from "next/link";
import { Info } from "lucide-react";

export default function GuestModeBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gold/10 border border-gold/20 px-4 py-3 text-sm text-ink-secondary">
      <span className="flex items-center gap-2">
        <Info size={16} className="text-gold shrink-0" />
        ゲストモードです。データは一定期間で自動的に削除されます。
      </span>
      <Link
        href="/settings/upgrade"
        className="shrink-0 rounded-full bg-gold-gradient text-white text-xs font-bold px-4 py-2 hover:brightness-110 transition-all"
      >
        アカウント作成してデータを保存
      </Link>
    </div>
  );
}
