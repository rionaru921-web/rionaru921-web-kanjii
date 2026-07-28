# Resend で kanji-lab.com のドメイン認証設定

新規登録の確認メールが Gmail・iCloud に届かない問題を解決するための手順です。
**この作業は Resend と Cloudflare のダッシュボードでのみ実施できます**
（Claude Code はブラウザ操作ができないため、自動化不可）。

なぜこれが必要か: Supabase のデフォルト送信元は Gmail・iCloud 等の大手プロバイダから
「見知らぬ送信元」として扱われ、迷惑メール判定・ブロックされやすい。Resend + 独自ドメイン
（SPF・DKIM・DMARC 認証済み）を使うことで「正規の送信元」と認識され、到達率が改善する。

## 所要時間: 15〜20分（DNS 反映待ちを除く）

---

## STEP 1: Resend Dashboard にログイン

1. ブラウザで `https://resend.com` を開く
2. 右上の「Sign in」をクリックし、既存アカウントでログイン
3. ダッシュボードのトップページが表示されればOK

---

## STEP 2: Domains ページで「Add Domain」

1. 左サイドバーの「Domains」をクリック
2. 右上の「+ Add Domain」ボタン（緑または黒の目立つボタン）をクリック
3. 入力欄に `kanji-lab.com` と入力（`www.` や `https://` は付けない）
4. Region の選択肢が出た場合は `Tokyo (ap-northeast-1)` を選択（日本向け送信に最適）
5. 「Add」ボタンをクリック

追加すると、Resend が「このドメインを認証するには次の DNS レコードを追加してください」という
一覧を表示します。次の STEP でこれを Cloudflare に転記します。

---

## STEP 3: 表示された DNS レコードを確認

Resend の Domain 詳細ページに、通常 3〜4 個の DNS レコードが表示されます
（Resend の UI は名前・値が自動生成されるため、以下は代表的な例です。
**実際に画面に表示された値をそのまま使ってください**、下記はあくまで形式の参考）:

| # | 種類 | 用途 |
|---|---|---|
| 1 | TXT (SPF) | 「この送信元からのメールは正規」と示す |
| 2 | TXT (DKIM) | メールの改ざんがないことを電子署名で証明 |
| 3 | MX | Resend がこのサブドメイン宛のバウンス通知を受け取るため |
| 4 | TXT (DMARC、任意だが推奨) | SPF/DKIM 失敗時の扱いポリシーを宣言、なりすまし対策 |

Resend の画面には各レコードの Type・Name・Value がそのままコピーできる形で表示されているので、
1つずつ「Copy」ボタン等でコピーしながら STEP 4 に進んでください。

---

## STEP 4: Cloudflare で DNS レコードを追加

1. 別タブで `https://dash.cloudflare.com` を開く
2. `kanji-lab.com` のサイトを選択
3. 左サイドバー「DNS」→「Records」
4. 「+ Add record」ボタンをクリックし、STEP 3 で確認した各レコードについて以下を繰り返す:
   - **Type**: Resend 画面の Type と同じものを選択（TXT / MX）
   - **Name**: Resend 画面の Name をそのまま貼り付け（`kanji-lab.com` 部分は省略して
     サブドメイン部分だけ入力するよう Cloudflare が案内する場合があります。例:
     `send.kanji-lab.com` と表示されていたら Name 欄には `send` とだけ入力すればOK）
   - **Content / Mail server**: Resend 画面の Value をそのまま貼り付け
   - MX レコードのみ **Priority** の入力欄が出るので、Resend 画面の Priority 値（通常 `10`）を入力
5. 「Save」をクリック

**⚠️ 最重要の注意点**: レコードを追加する画面に「Proxy status」というオレンジ/グレーの雲アイコンの
スイッチがあります。**必ず「DNS only」（グレーの雲）に設定してください**。
「Proxied」（オレンジの雲）のままだと、Cloudflare がリクエストを中継してしまい
Resend の DNS 認証が失敗します。TXT・MX レコードにはこのスイッチが出ない場合もありますが、
出た場合は必ずグレーにしてください。

---

## STEP 5: DNS 反映待ち + Resend で認証確認

1. DNS の反映には数分〜最大72時間かかりますが、Cloudflare 経由の場合は実際は
   5〜30分程度で反映されることがほとんどです
2. Resend の Domains ページに戻る
3. `kanji-lab.com` の行を開き、「Verify DNS Records」ボタンをクリック
4. すべてのレコードに緑色のチェックマーク（✅）が表示されれば成功
5. ドメインの Status が「Verified」（認証済み）になれば完了

うまく認証されない場合は 10分程度待ってから再度「Verify DNS Records」を押してください。
それでも失敗する場合は、Cloudflare 側で追加した Name・Value に入力ミスがないか、
Proxy status がグレーの雲になっているかを再確認してください。

---

## STEP 6: SMTP 認証情報を確認（次の設定で使用）

1. Resend の Domains → `kanji-lab.com` を選択
2. 画面内に「SMTP」に関する案内、または API Keys ページを確認
3. 以下の情報を控えておく（次の `docs/supabase-auth-setup.md` の手順で使用します）:

```
Host: smtp.resend.com
Port: 587（推奨。465でも可）
Username: resend
Password: あなたの RESEND_API_KEY の値
```

Resend の SMTP は「Username は固定で `resend`、Password には API キーをそのまま使う」という
仕組みです。新しいパスワードを別途発行する必要はありません。

---

## STEP 7: 完了したら

ここまで完了したら `docs/supabase-auth-setup.md` の「4. Auth → SMTP Settings」セクションに
進み、Supabase 側の Custom SMTP 設定を行ってください。

## トラブルシューティング

### DNS Records の Verify がずっと失敗する

- Cloudflare の「DNS」→「Records」で、追加したレコードの Name・Content が
  Resend 画面の表示と一致しているか再確認
- Proxy status が「DNS only」（グレーの雲）になっているか確認
- `dig TXT kanji-lab.com` や `https://dnschecker.org` で実際に反映されているか外部から確認できる

### Cloudflare で「レコードが既に存在します」と言われる

- 同じ Name (例: `resend._domainkey`) のレコードが既に別の内容で存在している可能性。
  古いレコードを編集するか削除してから、Resend の値で追加し直してください
