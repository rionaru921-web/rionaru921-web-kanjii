import type { Metadata } from "next";
import Link from "next/link";
import LegalContent from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "幹事ラボの特定商取引法に基づく表記です。",
};

const ROWS: Array<[string, React.ReactNode]> = [
  ["販売業者", "個人事業主・成瀬璃雄"],
  ["所在地", "お問い合わせいただいた方に個別に開示いたします（プライバシー保護のため、個人情報の一律公開は行っておりません）"],
  [
    "連絡先",
    <>
      <Link href="/legal/contact">お問い合わせページ</Link>のフォームよりご連絡ください
    </>,
  ],
  ["販売価格", "無料版: ¥0 / Premium（提供予定）: ¥490/月（税込）"],
  ["支払方法", "クレジットカード決済（Premium機能ご利用時）"],
  ["支払時期", "お申し込み時に即時決済"],
  ["サービス提供時期", "決済完了後、即時にご利用いただけます"],
  ["返品・キャンセルについて", "デジタルサービスの性質上、提供済みの月額料金は原則として返金いたしかねます"],
  ["動作環境", "Google Chrome / Safari / Firefox / Microsoft Edge の各最新版"],
];

export default function CommercePage() {
  return (
    <LegalContent title="特定商取引法に基づく表記" lastUpdated="2026年3月">
      <p className="mb-8">
        特定商取引法に基づき、以下のとおり表記いたします。本サービスは現在、無料機能のみを提供しております。有料のPremium機能は提供準備中であり、正式リリース時にあらためて本ページを更新いたします。
      </p>

      <table>
        <tbody>
          {ROWS.map(([label, value]) => (
            <tr key={label}>
              <th>{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-ink-muted mt-10">
        ※ Premium機能は現在準備中です。正式提供の際には、価格・支払方法等の詳細を本ページにて更新いたします。
      </p>
      <p className="text-xs text-ink-muted mt-4">
        本表記に関するお問い合わせ先: リオ（steplife.contact@gmail.com）
      </p>
    </LegalContent>
  );
}
