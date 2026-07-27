"use client";

import KeishaMockup from "@/components/landing/mockups/KeishaMockup";
import type { MockupInteractionEvent } from "@/components/landing/mockups/mockupTypes";
import SceneLayout from "./SceneLayout";

interface StepProps {
  autoPlay: boolean;
  onInteraction: (event: MockupInteractionEvent) => void;
}

export default function Step2Keisha({ autoPlay, onInteraction }: StepProps) {
  return (
    <SceneLayout
      chapterLabel="第二章"
      title="傾斜割り"
      description="先輩は多め、新人は控えめに。参加者に合わせた費用構成がワンタップで自動計算。"
      hint="「傾斜」バッジをタップすると金額が変わります"
    >
      <KeishaMockup size="lg" autoPlay={autoPlay} onInteraction={onInteraction} />
    </SceneLayout>
  );
}
