import ChochinIcon from "@/components/shared/ChochinIcon";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";
import GoldButton from "@/components/shared/GoldButton";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center px-4 py-16 text-center">
      <ChochinIcon className="w-24 h-32 animate-chochin-sway origin-top mb-6" />
      <p className="font-display text-6xl sm:text-7xl font-bold text-gold-gradient tracking-tight mb-4">
        404
      </p>
      <MizuhikiDivider className="mb-6" />
      <p className="text-ink font-semibold mb-2">お探しのページは見つかりませんでした</p>
      <p className="text-sm text-ink-secondary mb-8 max-w-xs leading-relaxed">
        URLが間違っているか、ページが移動または削除された可能性があります。
      </p>
      <GoldButton href="/" icon={Home}>
        ホームに戻る
      </GoldButton>
    </div>
  );
}
