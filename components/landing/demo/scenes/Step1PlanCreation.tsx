"use client";

import HeroMockup from "@/components/landing/HeroMockup";
import type { MockupInteractionEvent } from "@/components/landing/mockups/mockupTypes";
import SceneLayout from "./SceneLayout";

interface StepProps {
  autoPlay: boolean;
  onInteraction: (event: MockupInteractionEvent) => void;
}

export default function Step1PlanCreation({ autoPlay, onInteraction }: StepProps) {
  return (
    <SceneLayout
      chapterLabel="第一章"
      title="プラン作成"
      description="イベント種類を選んで、章立てでスムーズに情報を入力。30秒で幹事プランが完成します。"
      hint="イベント種類のチップをタップしてみましょう"
    >
      <HeroMockup size="lg" autoPlay={autoPlay} onInteraction={onInteraction} />
    </SceneLayout>
  );
}
