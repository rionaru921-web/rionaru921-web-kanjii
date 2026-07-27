"use client";

import CoachMockup from "@/components/landing/mockups/CoachMockup";
import type { MockupInteractionEvent } from "@/components/landing/mockups/mockupTypes";
import SceneLayout from "./SceneLayout";

interface StepProps {
  autoPlay: boolean;
  onInteraction: (event: MockupInteractionEvent) => void;
}

export default function Step5Coach({ autoPlay, onInteraction }: StepProps) {
  return (
    <SceneLayout
      chapterLabel="第五章"
      title="振り返り"
      description="開催後、AI幹事コーチと5問の対話で振り返り。幹事レベルが少しずつ上がっていきます。"
      hint="回答を選んで「次へ」を押してみましょう"
    >
      <CoachMockup size="lg" autoPlay={autoPlay} onInteraction={onInteraction} />
    </SceneLayout>
  );
}
