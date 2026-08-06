"use client";

import { WifiOff, RotateCw } from "lucide-react";
import ChochinIcon from "@/components/shared/ChochinIcon";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";
import GoldButton from "@/components/shared/GoldButton";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center px-4 py-16 text-center">
      <ChochinIcon className="w-24 h-32 animate-chochin-sway origin-top mb-6" />
      <div className="flex items-center gap-2 text-ink-secondary mb-4">
        <WifiOff size={20} />
        <span className="text-sm font-medium">オフライン</span>
      </div>
      <MizuhikiDivider className="mb-6" />
      <p className="text-ink font-semibold mb-2">このページは表示できません</p>
      <p className="text-sm text-ink-secondary mb-8 max-w-xs leading-relaxed">
        電波の良い場所で、もう一度お試しください。
      </p>
      <GoldButton onClick={() => window.location.reload()} icon={RotateCw}>
        再読み込み
      </GoldButton>
    </div>
  );
}
