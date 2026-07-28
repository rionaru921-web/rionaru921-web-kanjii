# Supabase Auth 本番設定チェックリスト

新規登録フローが正しく動作するために、Supabase Dashboard側で確認・設定すべき項目のまとめ。
アプリのコードからは変更できないため、以下は手動でDashboard上で確認してください。

**2026年7月の実機テストでGmail・iCloudにも確認メールが届かないことが判明**。
4節のSMTP設定を行う前に、まず [`docs/resend-domain-setup.md`](./resend-domain-setup.md)
でResendの `kanji-lab.com` ドメイン認証を完了させてください。

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
また Gmail・iCloud・日本の携帯キャリアメール（Softbank・docomo・au）への到達性が
低いことが2026年7月の実機テストで判明した（Gmail・iCloudが全滅、Softbankは既知）。
**確認メール送信の失敗が今回のエラーの引き金になっている可能性が高いため、
独自SMTPへの切り替えを強く推奨**。

候補（Resendを採用）:
- Resend（`RESEND_API_KEY` が既に `.env` にあるため、そのまま流用可能）
- SendGrid / Amazon SES（今回は未採用）

### 4-1. 前提: ドメイン認証を先に完了させる

Resendの独自ドメイン（`kanji-lab.com`）認証がまだの場合、先に
[`docs/resend-domain-setup.md`](./resend-domain-setup.md) の手順を完了させてください。
ドメイン未認証のままSMTP設定だけ行うと、送信元が `onboarding@resend.dev`
（Resendの共有サンドボックス）のままになり、到達性改善の効果が薄くなります。

### 4-2. Supabase Dashboard で Custom SMTP を有効化

所要時間: 5分

**STEP 1**: `https://supabase.com/dashboard/project/meoanfqmoxzaazlofkfu` を開く

**STEP 2**: 左サイドバー「Authentication」→「Settings」をクリック

**STEP 3**: ページ内を下にスクロールし、「SMTP Settings」セクションを探す

**STEP 4**: 「Enable Custom SMTP」のトグルスイッチをONにする

**STEP 5**: 表示された入力欄に以下を入力:

| 項目 | 値 |
|---|---|
| Sender email | `noreply@kanji-lab.com` |
| Sender name | `幹事ラボ` |
| Host | `smtp.resend.com` |
| Port | `587`（TLS。465を使う場合はSSLを選択） |
| Username | `resend` |
| Password | Resend の `RESEND_API_KEY` の値 |
| Minimum interval between emails | `60`（秒、デフォルトのままでOK） |

**STEP 6**: 「Save」をクリック

**STEP 7**: 保存後、Supabase側にテスト送信ボタンがあれば、自分宛にテストメールを送って
届くか確認する（無ければ次の5節の実機テストで確認）

### 4-3. Rate Limits を緩和

デフォルトSupabase SMTPの「1時間3通」制限は、Custom SMTP有効化後も別枠で
効いている場合があるため、あわせて緩和しておく:

1. 同じ「Authentication」→「Settings」ページ内の「Rate Limits」セクションを探す
2. 「Email OTP / Email Rate Limit」のような項目を `3` → `30`（1時間あたり30通）に変更
3. 「Save」

### 4-4. Email Templates の日本語化

1. 「Authentication」→「Email Templates」
2. 「Confirm signup」テンプレートを開く
3. Subject を日本語に変更: `【幹事ラボ】メールアドレスの確認`
4. Body（HTML）を以下のような日本語文面に差し替える:

```html
<h2>幹事ラボへのご登録ありがとうございます</h2>
<p>以下のリンクをクリックしてメールアドレスを確認してください:</p>
<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認する</a></p>
<p>このメールに心当たりがない場合は、無視してください。</p>
<p>--<br>幹事ラボ<br>https://kanji-lab.com</p>
```

5. 「Save」

**注意**: `{{ .ConfirmationURL }}` は変更・削除しないこと。このプレースホルダーが
Supabase側の確認リンク（検証後にアプリの `emailRedirectTo` へリダイレクト）を生成しています。

## 5. 設定確認後の再テスト手順

1. 上記1〜4をすべて確認・設定
2. Supabase Dashboard → **Logs → Auth Logs** で新規登録リクエストのステータスコードを確認
   - `500` 系エラーが出ていないか
   - メール送信関連のエラーメッセージが出ていないか
3. Resend Dashboard → **Logs** で送信履歴・失敗理由（バウンス等）を確認できる
4. 複数のメールプロバイダで実機テスト（最低1回ずつ）:
   - [ ] Gmail — https://kanji-lab.com/signup で新規登録 → 確認メール受信 → リンククリックで登録完了
   - [ ] iCloud — 同上
   - [ ] Yahoo! メール — 同上
   - [ ] Softbank / docomo / au（改善されたか、それでも届かない場合はアプリ内の
     案内文（Gmail等を推奨）が適切に表示されるか確認）

## 6. トラブルシューティング

### 問題: Gmail・iCloudにまだ届かない

- Resendの Domain Status が「Verified」になっているか確認
  （[`docs/resend-domain-setup.md`](./resend-domain-setup.md) のSTEP 5）
- 4-2 のSMTP設定値（Host/Port/Username/Password）に誤りがないか再確認
- Resend Dashboard の「Logs」で送信自体が失敗していないか確認
- 迷惑メールフォルダに振り分けられていないか確認（初回はここに入りやすい）

### 問題: Supabase側でSMTP設定の保存時にエラーになる

- Password が `RESEND_API_KEY` の値と完全に一致しているか（前後の空白混入に注意）
- Username が小文字の `resend` になっているか
- Port が `587`（TLS）か `465`（SSL）のどちらかで、選択している暗号化方式と一致しているか

### 問題: 確認メール自体が送信されない（フォームでエラーになる）

- Supabase Dashboard → Authentication → Providers → Email で
  「Confirm email」がONになっているか確認（OFFだと確認メールフロー自体が動かない）
- Auth Logs で `rate limit` 関連のエラーが出ていないか確認（4-3 の緩和が未反映の可能性）
