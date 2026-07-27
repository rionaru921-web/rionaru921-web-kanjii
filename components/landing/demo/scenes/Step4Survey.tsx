"use client";

import SurveyMockup from "@/components/landing/mockups/SurveyMockup";
import type { MockupInteractionEvent } from "@/components/landing/mockups/mockupTypes";
import SceneLayout from "./SceneLayout";

interface StepProps {
  autoPlay: boolean;
  onInteraction: (event: MockupInteractionEvent) => void;
}

export default function Step4Survey({ autoPlay, onInteraction }: StepProps) {
  return (
    <SceneLayout
      chapterLabel="第四章"
      title="アンケート"
      description="まだ決まってない集まりも、URLで参加者にアンケート送信。日程・予算・希望を一気に集計。"
      hint="回答をタップすると集計結果が変わります"
    >
      <SurveyMockup size="lg" autoPlay={autoPlay} onInteraction={onInteraction} />
    </SceneLayout>
  );
}
