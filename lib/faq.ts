import { ClipboardList, Rocket, Share2, Sparkles, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FaqQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: FaqQuestion[];
}

// Existing Q&A content (previously in components/landing/FAQ.tsx) is
// preserved verbatim below and only re-sorted into the new 5 categories —
// except the guest/account answer, corrected to match the real limits in
// lib/plans/limits.ts (free tier is 月10回, not unlimited; guest is 生涯3回,
// not monthly).
export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "start",
    label: "はじめる",
    icon: Rocket,
    items: [
      {
        id: "beginner",
        question: "幹事初心者ですが使えますか？",
        answer: "はい。プラン作成の各ステップがガイドされます。ゲストモードで無料お試しもできます。",
      },
      {
        id: "occasions",
        question: "どんな集まりで使えますか？",
        answer:
          "飲み会・旅行・歓迎会・送別会・忘年会・新年会など、あらゆる集まりに対応しています。",
      },
      {
        id: "guest-vs-account",
        question: "ゲストモードとアカウント登録の違いは？",
        answer:
          "ゲストモードは48時間後にデータが削除され、お店提案(AI補助)は生涯3回までです。アカウント登録するとデータが保存され、お店提案(AI補助)は月10回までご利用いただけます。",
      },
      {
        id: "switch-to-account",
        question: "途中でアカウント登録に切り替えられますか？",
        answer: "はい、ゲストで作ったプランはそのまま引き継げます。",
      },
      {
        id: "browsers",
        question: "対応ブラウザは？",
        answer:
          "モダンブラウザ全般（Chrome / Safari / Firefox / Edge）で動作します。iPhone / Androidのスマホでも快適にご利用いただけます。",
      },
    ],
  },
  {
    id: "plans",
    label: "プランについて",
    icon: ClipboardList,
    items: [
      {
        id: "max-members",
        question: "何人までのプランを作れますか？",
        answer: "特に上限は設けていません。数名の飲み会から、大人数の忘年会・部署会まで対応可能です。",
      },
      {
        id: "keisha-wari-what",
        question: "傾斜割りって何ですか？",
        answer: "「上司は多め、後輩は少なめ」等、役職・年齢に応じて支払額を調整する集金方法です。",
      },
      {
        id: "keisha-wari-effort",
        question: "幹事の負担はどれくらい軽減されますか？",
        answer: "各人の金額計算・端数調整・共有まで全部自動化。1つずつ電卓を叩く必要がなくなります。",
      },
      {
        id: "rounding",
        question: "100円単位以外の丸めもできますか？",
        answer: "100円・500円・1000円から選べます。",
      },
      {
        id: "plan-editable",
        question: "提案されたプランは編集できますか？",
        answer: "はい、全て後から自由に編集できます。",
      },
    ],
  },
  {
    id: "share",
    label: "共有・参加者",
    icon: Share2,
    items: [
      {
        id: "guest-account-required",
        question: "参加者もアカウント登録必要ですか？",
        answer: "不要です。共有URLをクリックするだけで参加できます。",
      },
      {
        id: "line-share",
        question: "LINEで共有できますか？",
        answer: "はい、URL共有・LINE共有・PDF出力・QRコード・iCalに対応しています。",
      },
      {
        id: "attendance",
        question: "出欠管理はどう使いますか？",
        answer: "参加者が共有URLから○/△/×で回答し、幹事は集計をダッシュボードで確認できます。",
      },
      {
        id: "which-share-method",
        question: "QRコード・PDF・URL、どれを使えばいい？",
        answer:
          "LINEやメールで送るならURL、当日印刷して渡すならPDF、その場でスマホから読み取ってもらうならQRコードが便利です。すべて自動生成されます。",
      },
    ],
  },
  {
    id: "pricing",
    label: "料金",
    icon: Wallet,
    items: [
      {
        id: "free",
        question: "無料で使えますか？",
        answer: "はい、基本機能は全て無料でお使いいただけます。",
      },
      {
        id: "premium",
        question: "Premiumプランはありますか？",
        answer:
          "月額¥490のPremiumプランを準備中です（お店提案(AI補助)無制限・履歴無制限保存など）。現在は全ユーザーが全機能を無料でご利用いただけます。",
      },
      {
        id: "premium-waitlist",
        question: "事前登録すると何かありますか？",
        answer: "料金ページから事前登録いただくと、リリース時に優先的にご案内します。",
      },
    ],
  },
  {
    id: "ai",
    label: "お店提案（AI補助）",
    icon: Sparkles,
    items: [
      {
        id: "ai-how",
        question: "お店提案(AI補助)はどのように行われますか？",
        answer:
          "参加人数・予算・雰囲気を伝えると、AIがお店候補・タイムテーブルを提案します。最終的な決定は幹事であるあなたが行えます。",
      },
      {
        id: "ai-limit",
        question: "月10回制限とは？",
        answer:
          "AIによるお店提案を利用できる回数です。アカウント登録ユーザーは月10回、ゲストユーザーは生涯3回まで。上限に達しても、手動でのお店入力は制限なくご利用いただけます。",
      },
      {
        id: "ai-coverage",
        question: "対応していないエリアはありますか？",
        answer:
          "HotPepperグルメサーチのカバー範囲外の地域では、候補が少ないか出ない場合があります。その場合は手動でお店をご入力ください。",
      },
    ],
  },
];
