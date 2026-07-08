import type { Metadata } from "next";
import Link from "next/link";
import LegalContent from "@/components/legal/LegalContent";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "Kanjiiのプライバシーポリシーです。",
};

const TOC = [
  { id: "p1", label: "1. 事業者情報" },
  { id: "p2", label: "2. 取得する情報" },
  { id: "p3", label: "3. 利用目的" },
  { id: "p4", label: "4. 第三者提供" },
  { id: "p5", label: "5. 外部サービス" },
  { id: "p6", label: "6. データの保管期間" },
  { id: "p7", label: "7. ユーザーの権利" },
  { id: "p8", label: "8. Cookie" },
  { id: "p9", label: "9. お子様の個人情報" },
  { id: "p10", label: "10. 改定" },
];

export default function PrivacyPage() {
  return (
    <LegalContent title="プライバシーポリシー" lastUpdated="2026年3月" toc={TOC}>
      <p className="mb-8">
        Kanjii（以下「本サービス」）は、ユーザーの個人情報を適切に取り扱うことを重要な責務と考え、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
      </p>

      <section>
        <h2 id="p1">1. 事業者情報</h2>
        <ul>
          <li>サービス名: Kanjii</li>
          <li>運営者: 個人開発者</li>
          <li>
            お問い合わせ: <Link href="/legal/contact">お問い合わせページ</Link>経由
          </li>
        </ul>
      </section>

      <section>
        <h2 id="p2">2. 取得する情報</h2>
        <ul>
          <li>アカウント情報: メールアドレス、表示名、パスワード（Supabaseによりハッシュ化して保存）</li>
          <li>利用情報: 検索履歴、飲み会・旅行の記録、集金設定（任意で登録いただく情報です）</li>
          <li>Cookie・アクセスログ: IPアドレス、ブラウザ情報、参照元URL</li>
          <li>Google Analyticsを通じて取得する匿名の利用統計情報</li>
        </ul>
      </section>

      <section>
        <h2 id="p3">3. 利用目的</h2>
        <ul>
          <li>本サービスの提供・維持・改善のため</li>
          <li>ユーザーサポート対応のため</li>
          <li>不正利用の防止・検知のため</li>
          <li>個人を特定しない形での統計データの作成のため</li>
        </ul>
      </section>

      <section>
        <h2 id="p4">4. 第三者提供</h2>
        <p>取得した個人情報は、以下の場合を除き第三者に提供しません。</p>
        <ul>
          <li>法令に基づく開示要請があった場合</li>
          <li>店舗検索のため、検索クエリをホットペッパーグルメAPIへ送信する場合</li>
          <li>AI提案機能のご利用時、匿名化したデータをAnthropic Claude APIへ送信する場合</li>
        </ul>
      </section>

      <section>
        <h2 id="p5">5. 外部サービス</h2>
        <p>本サービスは、以下の外部サービスを利用しています。</p>
        <table>
          <thead>
            <tr>
              <th>サービス</th>
              <th>用途</th>
              <th>プライバシーポリシー</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase</td>
              <td>データベース・認証</td>
              <td>
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  supabase.com/privacy
                </a>
              </td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>ホスティング</td>
              <td>
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                  vercel.com/legal/privacy-policy
                </a>
              </td>
            </tr>
            <tr>
              <td>ホットペッパーグルメAPI</td>
              <td>店舗検索</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Anthropic Claude API</td>
              <td>AI提案</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Google Analytics 4</td>
              <td>利用分析</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="p6">6. データの保管期間</h2>
        <ul>
          <li>アカウント情報: 退会まで保管</li>
          <li>履歴データ: 退会後30日以内に削除</li>
          <li>アクセスログ: 90日間保管</li>
        </ul>
      </section>

      <section>
        <h2 id="p7">7. ユーザーの権利</h2>
        <p>
          ユーザーは、自己の個人情報について、開示、訂正、削除、利用停止を求めることができます。ご希望の場合は
          <Link href="/legal/contact">お問い合わせフォーム</Link>
          からご請求ください。
        </p>
      </section>

      <section>
        <h2 id="p8">8. Cookie</h2>
        <ul>
          <li>必須Cookie: ログイン状態・認証セッションの維持に使用します</li>
          <li>
            分析Cookie: Google Analyticsによるアクセス解析に使用します。ブラウザの設定等により無効化することが可能です
          </li>
        </ul>
      </section>

      <section>
        <h2 id="p9">9. お子様の個人情報</h2>
        <p>
          13歳未満の方が本サービスをご利用になる場合は、保護者の方の同意を得たうえでご利用ください。
        </p>
      </section>

      <section>
        <h2 id="p10">10. 改定</h2>
        <p>
          本ポリシーの内容は、ユーザーへの事前の通知なく変更されることがあります。変更後の内容は、本ページに掲載した時点から効力を生じるものとします。
        </p>
      </section>

      <p className="text-xs text-ink-muted mt-10">制定日: 2026年3月</p>
    </LegalContent>
  );
}
