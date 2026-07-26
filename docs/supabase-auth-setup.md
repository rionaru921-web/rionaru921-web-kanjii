# Supabase Auth 本番設定チェックリスト

新規登録フローが正しく動作するために、Supabase Dashboard側で確認・設定すべき項目のまとめ。
アプリのコードからは変更できないため、以下は手動でDashboard上で確認してください。

## 背景: 「⓵ {}」エラーと確認メール未着について

2026年7月、Softbankキャリアメール（`@i.softbank.jp`）での新規登録時に以下の事象を確認:

- 登録ボタン押下後、画面に `⓵ {}` という意味不明なエラーが表示される
- 確認メールが届かない

調査の結果、「⓵」はエラー表示用の `AlertCircle` アイコン、「{}」は
`signUpError.message` の値そのものであることが判明。Supabaseのサーバーが
標準的な `{msg, code}` 形式ではないエラーレスポンスを返した場合、
`@supabase/auth-js` 内部の `_getErrorMessage` が `JSON.stringify(err)` に
フォールバックし、たまたま空オブジェクト相当の値だったため `"{}"` という
文字列になっていた（`node_modules/@supabase/auth-js/dist/main/lib/errors.js`）。

**最有力の仮説**: `enable_confirmations = true` の場合、signupリクエストは
確認メール送信を同期的に行う。デフォルトSMTPがSoftbank宛のメール送信に
失敗すると、GoTrue（Supabase Auth サーバー）が想定外の形状のエラーを返し、
それが client 側で `{}` として表示される。つまり「⓵ {}」表示と
「メール未着」は同一原因（メール送信失敗）から生じている可能性が高い。

アプリ側では `lib/auth/error-translator.ts` に防御的な修正を入れ、
JSONオブジェクトのような文字列が来た場合は汎用的な日本語メッセージに
差し替えるようにした。ただし根本原因（メール送信失敗）はDashboard側の
設定でしか解決できない。

## 1. Auth → URL Configuration

- **Site URL**: 本番ドメイン（例: `https://kanji-lab.com`）になっているか確認
- **Redirect URLs**: 本番ドメインが許可リストに含まれているか確認
  - `https://kanji-lab.com/**`
  - 開発用に `http://localhost:3002/**` も追加しておくと便利

アプリ側は `emailRedirectTo` に `window.location.origin` を動的に使用している
（`components/auth/SignupForm.tsx`）ため、Site URL自体が原因になる可能性は低いが、
**Redirect URLsの許可リストに本番ドメインが無いと、確認リンクのリダイレクトが
Site URLにフォールバックしてしまう**ため要確認。

## 2. Auth → Providers → Email

- **Enable Email provider**: ON
- **Confirm email**: ON（現状の実装はこれが有効な前提でメール確認フローを実装している）

## 3. Auth → Email Templates

- 「Confirm signup」テンプレートの文面・送信元表示名を確認
- 可能であれば日本語化

## 4. Auth → SMTP Settings（最重要・推奨）

デフォルトのSupabase SMTPは送信数に制限があり（無料枠は目安3通/時間程度）、
また日本の携帯キャリアメール（Softbank・docomo・au）への到達性が低いことが
知られている。**確認メール送信の失敗が今回のエラーの引き金になっている
可能性が高いため、独自SMTPへの切り替えを強く推奨**。

候補:
- Resend（`RESEND_API_KEY` が既に `.env` にあるため、そのまま流用可能）
- SendGrid
- Amazon SES

**Resendを使う場合の設定例**:

| 項目 | 値 |
|---|---|
| Host | `smtp.resend.com` |
| Port | `587` |
| Username | `resend` |
| Password | Resend APIキー |
| Sender email | `noreply@kanji-lab.com`（検証済みドメイン） |

## 5. 設定確認後の再テスト手順

1. 上記1〜4を確認・設定
2. Supabase Dashboard → **Logs → Auth Logs** で新規登録リクエストのステータスコードを確認
   - `500` 系エラーが出ていないか
   - メール送信関連のエラーメッセージが出ていないか
3. 複数のメールプロバイダで実機テスト:
   - Gmail
   - iCloud
   - Yahoo!
   - Softbank / docomo（改善されたか、それでも届かない場合はアプリ内の
     案内文（Gmail等を推奨）が適切に表示されるか確認）
