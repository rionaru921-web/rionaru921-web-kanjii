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
      {
        id: "mobile",
        question: "スマホだけで最後まで完結できますか？",
        answer:
          "はい。プラン作成から共有、出欠確認まで、すべてスマホのブラウザだけで完結します。アプリのインストールは不要です。",
      },
      {
        id: "solo-start",
        question: "参加者の情報が揃っていなくても始められますか？",
        answer:
          "はい、幹事お一人で土台となるプランを作り始められます。日程・人数・お店は後から追加・編集できます。",
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
      {
        id: "history",
        question: "過去のプランを見返せますか？",
        answer:
          "アカウント登録すると「履歴」から過去に作成したプランを一覧で確認できます。ゲスト利用の場合はデータが48時間で削除されるため、残しておきたい場合は登録がおすすめです。",
      },
      {
        id: "nijikai",
        question: "二次会の情報も一緒に管理できますか？",
        answer: "はい、二次会の会場やスケジュールも同じプラン内にまとめて追加できます。",
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
      {
        id: "share-link-expiry",
        question: "共有したURLは無期限で有効ですか？",
        answer: "はい、特に期限を設定しない限り、共有URLは削除するまで無期限で有効です。",
      },
      {
        id: "survey-feature",
        question: "日程がまだ決まっていなくても参加者に聞けますか？",
        answer:
          "はい、アンケート機能を使えば、日程候補・予算・ジャンルの希望を参加者にURLで送って一括集計できます。集計結果からそのままプランを作成することもできます。",
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
      {
        id: "hidden-fees",
        question: "隠れた課金や広告表示はありますか？",
        answer:
          "現在、幹事ラボに広告や隠れた課金はありません。基本機能は今後も無料でご利用いただけます。",
      },
      {
        id: "payment-method",
        question: "支払い方法は？",
        answer:
          "Premiumプラン提供開始時はクレジットカード決済に対応予定です。現在Premiumは準備中のため、決済は発生しません。",
      },
      {
        id: "corporate-pricing",
        question: "法人利用の場合の料金は？",
        answer:
          "忘年会・歓送迎会の企画から経費精算まで対応する法人向け機能は現在準備中です。正式リリース時にあらためて料金体系をご案内します。",
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
      {
        id: "ai-not-found",
        question: "AI提案でお店が見つからない場合は？",
        answer:
          "予算・ジャンルなどの条件を段階的に緩和しながら再検索します。それでも見つからない場合は、手動でお店を入力すれば確実にプランを作成できます。AI補助はあくまで「お店探しの補助」としてご活用ください。",
      },
      {
        id: "ai-editable",
        question: "AIが提案した内容も手動で編集できますか？",
        answer: "はい、AIが提案したお店やタイムテーブルも含め、プランは全て後から自由に編集できます。",
      },
      {
        id: "ai-privacy",
        question: "プライバシー的にAIに何が送られていますか？",
        answer:
          "参加人数・予算・希望ジャンルなど、お店探しに必要な条件のみを送信しています。氏名・連絡先といった参加者個人を特定する情報は送信されません。",
      },
    ],
  },
];
