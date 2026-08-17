# Supabase 認証メール日本語化 手順

Wave 29-W-v2。Supabase Auth のメールテンプレートは Dashboard 側の設定であり、
アプリのコードからは変更できないため、リオさんに以下を手動で実施していただく
必要があります。

アプリ側（`emailRedirectTo` の設定、送信後画面の迷惑メール案内など）は
既にコード側で対応済みです。ここでの作業は Dashboard 上のテンプレート文言の
差し替えのみです。

## Step 1: Dashboard にログイン

https://supabase.com/dashboard/project/meoanfqmoxzaazlofkfu/auth/templates

## Step 2: 各テンプレートを日本語に書き換え

### Confirm signup（メール確認）

件名:
```
【幹事ラボ】メールアドレス確認のお願い
```

本文（Message body、HTML）:
```html
<h2>幹事ラボへようこそ</h2>
<p>幹事ラボへのご登録ありがとうございます。</p>
<p>下記のボタンをクリックして、メールアドレスの確認を完了してください。</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 24px;background:#C4402F;color:#fff;text-decoration:none;border-radius:8px;">メールアドレスを確認する</a></p>
<p>このメールに心当たりがない場合は、破棄してください。</p>
<hr>
<p style="color:#888;font-size:12px;">
幹事ラボ | https://kanji-lab.com<br>
お問い合わせ: steplife.contact@gmail.com
</p>
```

### Reset Password（パスワードリセット）

件名:
```
【幹事ラボ】パスワードリセットのご案内
```

本文:
```html
<h2>パスワードリセット</h2>
<p>パスワードリセットのリクエストを受け付けました。</p>
<p>下記のボタンから新しいパスワードを設定してください。</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 24px;background:#C4402F;color:#fff;text-decoration:none;border-radius:8px;">パスワードを再設定する</a></p>
<p>このリクエストに心当たりがない場合は、このメールを破棄してください。</p>
```

### Magic Link（使用している場合のみ）

件名:
```
【幹事ラボ】ログインリンク
```

本文:
```html
<p>幹事ラボへのログインリンクです。</p>
<p><a href="{{ .ConfirmationURL }}">ログインする</a></p>
```

## Step 3: 送信元（From）名の変更（推奨）

Authentication → Settings → SMTP Settings

- Sender name: `幹事ラボ`
- Sender email: デフォルトのままでOK（または独自SMTP設定時はそちらのアドレス）

## Step 4: 迷惑メール対策（推奨・任意）

デフォルトの Supabase 内蔵SMTPは迷惑メール判定されやすく、送信量も
4通/時間に制限されています（下記「補足」参照）。以下のいずれかを検討してください。

### 選択肢1: カスタムSMTP設定（Resend推奨）

- Resend: 無料枠 100通/日
- Authentication → Settings → SMTP Settings で送信元ドメインとAPIキーを設定

### 選択肢2: 現状維持 + ユーザーへの案内

Web版の signup 画面・送信後画面には、既に「迷惑メールフォルダもご確認ください」
「キャリアメールは届きにくい場合があります」といった案内文が実装済みのため、
テンプレート文言の日本語化（Step 2）だけでも体感は大きく改善します。

## 補足: Supabase メール送信量制限

無料枠のデフォルトSMTPは 4通/時間 の制限があり、頻繁にsignupすると
「Email rate limit exceeded」エラーになります。テスト時は複数のメールアドレスを
使い分けるか、時間を空けてください。
