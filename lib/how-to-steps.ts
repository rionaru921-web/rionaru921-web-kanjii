import { GraduationCap, Share2, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type HowToMockupKind = "form" | "share" | "coach";

export interface HowToStepData {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  mockup: HowToMockupKind;
}

export const HOW_TO_STEPS: HowToStepData[] = [
  {
    step: 1,
    icon: Sparkles,
    title: "プランをつくる",
    description: "イベント種類・日程・会場・予算・参加者を入力。ログイン不要、30秒で完成します。",
    mockup: "form",
  },
  {
    step: 2,
    icon: Share2,
    title: "共有する",
    description: "完成したプランをQRコード・PDF・URLで参加者に一斉共有。参加者は登録不要で閲覧できます。",
    mockup: "share",
  },
  {
    step: 3,
    icon: GraduationCap,
    title: "振り返る",
    description: "開催後、AI幹事コーチが5問の対話でフィードバック。次回への学びを積み重ね、幹事レベルが上がります。",
    mockup: "coach",
  },
];
