"use client";

import ShareMockup from "@/components/landing/mockups/ShareMockup";
import type { MockupInteractionEvent } from "@/components/landing/mockups/mockupTypes";
import SceneLayout from "./SceneLayout";

interface StepProps {
  autoPlay: boolean;
  onInteraction: (event: MockupInteractionEvent) => void;
}

export default function Step3Share({ autoPlay, onInteraction }: StepProps) {
  return (
    <SceneLayout
      chapterLabel="第三章"
      title="共有"
      description="完成したプランをQR・PDF・URLでワンタップ共有。参加者は登録不要で閲覧できます。"
      hint="QR / PDF / URL のタブを切り替えられます"
    >
      <ShareMockup size="lg" autoPlay={autoPlay} onInteraction={onInteraction} />
    </SceneLayout>
  );
}
