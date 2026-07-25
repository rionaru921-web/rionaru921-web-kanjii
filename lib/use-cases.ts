import { Building2, Cake, PartyPopper, Plane, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface UseCaseMockupData {
  eventName: string;
  chapterNumber: string;
  chapterTitle: string;
  progressPercent: number;
  chips: string[];
  activeChipIndex: number;
  date: string;
}

export interface UseCase {
  id: string;
  icon: LucideIcon;
  title: string;
  copy: string;
  mockup: UseCaseMockupData;
}

export const USE_CASES: UseCase[] = [
  {
    id: "monthly",
    icon: Building2,
    title: "毎月の部署飲み会",
    copy: "毎月の集まりを、テンプレートで一瞬に。",
    mockup: {
      eventName: "第3営業部 定例飲み会",
      chapterNumber: "第一章",
      chapterTitle: "はじまり",
      progressPercent: 17,
      chips: ["飲み会", "忘年会", "新年会", "歓迎会"],
      activeChipIndex: 0,
      date: "2026年8月20日(木) 19:00〜",
    },
  },
  {
    id: "welcome-farewell",
    icon: Users,
    title: "歓迎会・送別会",
    copy: "特別な集まりに、少しの上品さを。",
    mockup: {
      eventName: "〇〇さんの歓迎会",
      chapterNumber: "第三章",
      chapterTitle: "どこで",
      progressPercent: 50,
      chips: ["歓迎会", "送別会", "記念日", "誕生日"],
      activeChipIndex: 0,
      date: "2026年9月4日(金) 19:00〜",
    },
  },
  {
    id: "circle",
    icon: PartyPopper,
    title: "サークル・部活の集まり",
    copy: "みんなの都合、一目でわかる。",
    mockup: {
      eventName: "テニスサークル打ち上げ",
      chapterNumber: "第二章",
      chapterTitle: "いつ",
      progressPercent: 33,
      chips: ["飲み会", "忘年会", "新年会", "歓迎会"],
      activeChipIndex: 0,
      date: "候補日を3件から選択中…",
    },
  },
  {
    id: "trip",
    icon: Plane,
    title: "旅行の幹事",
    copy: "1泊2日も、日帰りも。まとめて共有。",
    mockup: {
      eventName: "みんなで一泊温泉旅行",
      chapterNumber: "第四章",
      chapterTitle: "いくら",
      progressPercent: 67,
      chips: ["旅行", "飲み会", "記念日", "誕生日"],
      activeChipIndex: 0,
      date: "2026年10月10日(土)〜11日(日)",
    },
  },
  {
    id: "birthday",
    icon: Cake,
    title: "誕生日サプライズ",
    copy: "幹事だけが知る秘密、こっそり管理。",
    mockup: {
      eventName: "〇〇さん 32歳のお祝い",
      chapterNumber: "第六章",
      chapterTitle: "もっと",
      progressPercent: 100,
      chips: ["誕生日", "記念日", "歓迎会", "送別会"],
      activeChipIndex: 0,
      date: "幹事だけのメモを記入中…",
    },
  },
];
