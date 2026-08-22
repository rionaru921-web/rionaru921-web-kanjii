# Wave 29-W-v4: LINEログイン & Sign in with Apple 設定手順

コード側は実装済み（`app/api/auth/line/route.ts`, `app/auth/callback/route.ts`,
`lib/auth/line-login.ts`, `components/auth/LineLoginButton.tsx`,
`components/auth/AppleLoginButton.tsx`）。以下はリオさんが手動で行う設定。
どちらも未設定の間は `NEXT_PUBLIC_LINE_LOGIN_ENABLED` /
`NEXT_PUBLIC_APPLE_LOGIN_ENABLED` が `false` のままなので、ログイン画面に
ボタン自体が表示されず、既存の認証フローには一切影響しない。

## 重要な前提: LINEはSupabaseの「標準OAuthプロバイダ」ではない

Supabase DashboardのAuthentication > Providersには、あらかじめ用意された
プロバイダ（Google, Apple, GitHub, Azure...）しか並んでおらず、任意の
プロバイダを追加できる「カスタムOAuthプロバイダ」枠は存在しない。そのため
LINEログインは、Supabase側の設定を一切必要としない代わりに、Next.js側に
独自のOAuthブリッジ（`app/api/auth/line/route.ts`）を実装してある:

1. LINEの認可エンドポイントへリダイレクト
2. LINEからの`code`をアクセストークン + `id_token`(OIDC)に交換
3. `id_token`をLINEの公開鍵(JWKS)でその場検証（署名・issuer・audience・nonce）
4. 検証済みのLINEユーザーIDから決定論的な内部メールアドレスを生成し、
   Supabase Admin APIで対応するユーザーを作成 / 取得
5. `admin.generateLink` + `verifyOtp`でSupabaseの本物のセッションCookieを発行

Sign in with Appleはこれとは別で、Supabaseが標準サポートしているので
Dashboard側の設定だけで動く（下記参照）。

---

## Part 1: Sign in with Apple（Supabase標準機能）

1. **Apple Developer側**
   - [Apple Developer](https://developer.apple.com/account/) > Certificates,
     Identifiers & Profiles > Identifiers で、既存のApp ID
     (`6800397796`に対応するBundle ID) に **Sign In with Apple** capability
     を追加。
   - 同じくIdentifiers > Services IDsで新規のServices IDを作成し、
     「Sign In with Apple」を有効化。ここで設定する
     **Return URL(callback URL)** は、Supabaseプロジェクトの
     `https://<project-ref>.supabase.co/auth/v1/callback` を指定する
     （このアプリの`/auth/callback`ではなく、Supabase側のURLである点に注意）。
   - Keys > 新規キー作成で「Sign In with Apple」を有効化したキーを発行し、
     `.p8`ファイルをダウンロード（一度しかダウンロードできないので保管）。

2. **Supabase Dashboard側**
   - Authentication > Providers > Apple を開いて有効化。
   - Services ID・Team ID・Key ID・上でダウンロードした`.p8`の中身を入力。
   - 保存。

3. **このアプリ側**
   - `.env.local`（本番はVercelの環境変数）に
     `NEXT_PUBLIC_APPLE_LOGIN_ENABLED=true` を設定。
   - これでログイン/新規登録画面に「Appleでサインイン」ボタンが表示される。

参考: [Supabase公式 - Login with Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple)

---

## Part 2: LINEログイン（カスタムOIDCブリッジ）

### 2-1. LINE Developers Consoleでチャネルを作成

1. [LINE Developers Console](https://developers.line.biz/console/) にログイン
   （LINE Business IDが必要。無料）。
2. プロバイダーを作成（未作成の場合）→ 幹事ラボ用の新規チャネルを作成し、
   チャネルの種類は **「LINEログイン」** を選択。
3. チャネル基本設定で以下を確認・登録:
   - **チャネルID** → `LINE_CHANNEL_ID`
   - **チャネルシークレット** → `LINE_CHANNEL_SECRET`
4. 「LINEログイン設定」タブ > **コールバックURL** に以下を登録:
   - 本番: `https://kanji-lab.com/api/auth/line`
   - 開発: `http://localhost:3002/api/auth/line`
5. 「OpenID Connect」が有効になっていることを確認（`scope=openid`を使うため）。
6. メールアドレススコープが必要な場合は「メールアドレス許可申請」を別途
   LINE側で行う（審査あり）。**申請しなくても動作する** —
   `lib/auth/line-login.ts`の`syntheticLineEmail()`が、LINEのユーザーID
   (`sub`)から決定論的な内部メールアドレスを自動生成してSupabaseユーザーに
   紐付けるため、メールアドレスの取得は必須ではない。

### 2-2. 環境変数を設定

`.env.local`（本番はVercel）に以下を設定:

```
LINE_CHANNEL_ID=（2-1で取得したチャネルID）
LINE_CHANNEL_SECRET=（2-1で取得したチャネルシークレット）
LINE_CALLBACK_URL=https://kanji-lab.com/api/auth/line   # 本番
# 開発環境では http://localhost:3002/api/auth/line
NEXT_PUBLIC_LINE_LOGIN_ENABLED=true
```

`LINE_CALLBACK_URL`は2-1でLINE Developers Consoleに登録した値と
**完全に一致**している必要がある（末尾のスラッシュ有無も含む）。

### 2-3. 動作確認

1. ログイン画面 (`/login`) または新規登録画面 (`/signup`) を開き、
   緑色の「LINEでログイン」ボタンが表示されることを確認。
2. クリック → LINEの認可画面 → 許可 → `/dashboard`にリダイレクトされ
   ログイン状態になっていればOK。
3. うまくいかない場合、サーバーログ（Vercelなら Functions > Logs）に
   `LINE login error:` というメッセージが出るので、そこからどの段階
   （トークン交換／id_token検証／Supabaseセッション発行）で失敗しているか
   切り分けられる。よくある原因: `LINE_CALLBACK_URL`の不一致、
   `LINE_CHANNEL_SECRET`の誤り。

### 2-4. セキュリティ上の設計メモ

- `state`パラメータをhttpOnly Cookieに保存し、callback時に一致検証する
  ことでCSRFを防いでいる（`app/api/auth/line/route.ts`）。
- `nonce`パラメータも同様にCookie保存 → id_tokenのclaimと比較検証する
  ことで、盗んだ認可コードの再利用（リプレイ）を防いでいる。
- id_tokenの署名検証はLINEの公開鍵(JWKS, `https://api.line.me/oauth2/v2.1/certs`)
  をその場で取得して行っており、LINEが発行したトークンであることを暗号学的に
  保証している（issuer/audienceも同時に検証）。
