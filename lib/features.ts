import { CalendarCheck, Coins, GraduationCap, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FeatureMockupKind = "keisha" | "calendar" | "share" | "coach";

export interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  mockup: FeatureMockupKind;
}

export const FEATURES: Feature[] = [
  {
    id: "keisha",
    icon: Coins,
    title: "気配りある、割り勘。",
    subtitle:
      "上司は多めに、新人は控えめに。6段階の傾斜配分で、みんなが納得する費用構成。",
    mockup: "keisha",
  },
  {
    id: "calendar",
    icon: CalendarCheck,
    title: "みんなの都合、一目で。",
    subtitle:
      "和暦・祝日表示に対応したカレンダーで日程を決め、参加・不参加はステータスで一目瞭然に。",
    mockup: "calendar",
  },
  {
    id: "share",
    icon: Share2,
    title: "共有は、ワンタップで。",
    subtitle:
      "完成したプランをURL・QRコード・PDFで即共有。参加者はアカウント登録なしで閲覧できます。",
    mockup: "share",
  },
  {
    id: "coach",
    icon: GraduationCap,
    title: "開催後の、静かな振り返り。",
    subtitle: "5問の対話で、幹事としての成長を可視化。次の開催がもっと楽しみになる。",
    mockup: "coach",
  },
];
