# Kanjii RLS監査レポート

生成日時: 2026-07-12T07:18:41Z
対象Supabaseプロジェクト: `meoanfqmoxzaazlofkfu`
監査範囲: `supabase/migrations/*.sql`(全5ファイル)+ `app/`, `lib/supabase/`, `components/` のSupabaseアクセスコード全件

## サマリ

- 検出テーブル数: 6(`payment_settings`, `history`, `share_tokens`, `profiles`, `manual_plans`, `manual_plan_members`)
- 検出ポリシー数: 24(既存マイグレーション内の `create policy` 文の合計)
- Critical: 1件 / High: 1件 / Medium: 3件 / Info: 4件

全テーブルで **RLSは有効化済み**(`ENABLE ROW LEVEL SECURITY` 漏れなし)。最大のリスクは `share_tokens` テーブルの1ポリシーに集中している。

---

## 検出テーブル一覧(Phase 1サマリ)

| テーブル | RLS | 所有者列 | 備考 |
|---|---|---|---|
| `payment_settings` | ✅ 有効 | `user_id` | 集金用の銀行口座情報を保持 |
| `history` | ✅ 有効 | `user_id` | AI提案フロー(飲み会/旅行)の確定履歴。UPDATEポリシーなし(仕様通り、後述) |
| `share_tokens` | ✅ 有効 | `user_id`(発行者) | `history` 用の共有トークン。**SELECTが全公開**(後述 Critical) |
| `profiles` | ✅ 有効 | `id` = `auth.users.id` | 表示名・アバター |
| `manual_plans` | ✅ 有効 | `user_id` | 手動プラン(Phase A以降)。独自の `share_token` 列を持つが**公開SELECTポリシーは意図的に無し** |
| `manual_plan_members` | ✅ 有効 | `plan_id` 経由で `manual_plans.user_id` | 手動プランの参加者。出欠(`attendance_status`)・支払(`payment_status`)状態を保持 |

想定されていた独立の `members` / `attendance` / `attendances` テーブルは存在せず、実際には `manual_plan_members` 1テーブルに統合されている(`attendance_status` 列)。

## 検出ポリシー一覧

### payment_settings(`20260101000000_pdf_share.sql:21-25`)
- `view own payment` (SELECT): `USING (auth.uid() = user_id)`
- `insert own payment` (INSERT): `WITH CHECK (auth.uid() = user_id)`
- `update own payment` (UPDATE): `USING (auth.uid() = user_id)` ← **WITH CHECK なし**
- `delete own payment` (DELETE): `USING (auth.uid() = user_id)`

### history(`20260101000000_pdf_share.sql:45-48`)
- `view own history` (SELECT): `USING (auth.uid() = user_id)`
- `insert own history` (INSERT): `WITH CHECK (auth.uid() = user_id)`
- `delete own history` (DELETE): `USING (auth.uid() = user_id)`
- UPDATEポリシーなし(→ 全ロールでUPDATE不可。アプリもUPDATEしないため意図通り)

### share_tokens(`20260101000000_pdf_share.sql:61-64`)
- `anyone view share` (SELECT): `USING (true)` ← **ロール指定なし・条件なし = 誰でも全行閲覧可**
- `insert own share` (INSERT): `WITH CHECK (auth.uid() = user_id)`
- `delete own share` (DELETE): `USING (auth.uid() = user_id)`
- UPDATEポリシーなし(`view_count` の更新は admin クライアントのみが実行)

### profiles(`20260101000001_profiles.sql:17-31`)
- `Users can view own profile` (SELECT): `USING (auth.uid() = id)`
- `Users can insert own profile` (INSERT): `WITH CHECK (auth.uid() = id)`
- `Users can update own profile` (UPDATE): `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`
- DELETEポリシーなし(`auth.users` 削除時のCASCADEのみ。アプリからの直接削除なし)

### manual_plans(`20260710000000_manual_plans.sql:81-100`)
- `Users can view own plans` (SELECT): `USING (auth.uid() = user_id)`
- `Users can insert own plans` (INSERT): `WITH CHECK (auth.uid() = user_id)`
- `Users can update own plans` (UPDATE): `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- `Users can delete own plans` (DELETE): `USING (auth.uid() = user_id)`
- 公開SELECTポリシーなし(意図的。コメントで明記済み — 後述)

### manual_plan_members(`20260710000000_manual_plans.sql:104-153`)
- SELECT/INSERT/UPDATE/DELETE すべて `EXISTS (select 1 from manual_plans where manual_plans.id = manual_plan_members.plan_id and manual_plans.user_id = auth.uid())` で統一。UPDATEにはWITH CHECKも同条件で付与済み。

---

## 匿名アクセスが必要な機能(実装確認済み)

| 経路 | 実装方式 | RLSとの関係 |
|---|---|---|
| `/share/[token]`(history共有ページ) | `createAdminClient()`(service-role)で `share_tokens`→`history` を1件取得 | RLSは**バイパス**。トークン一致1件のみをコードで絞り込み |
| `/api/share/[token]` | 同上(API版) | 同上 |
| `/share/plan/[token]`(manual_plans共有ページ) | 同上で `manual_plans`→`manual_plan_members` を取得 | 同上。`manual_plans`に公開SELECTポリシーが無いのはこの設計のため(意図通り) |
| `/api/share/plan/[token]/ics` | 同上 | 同上 |
| `/api/share/plan/[token]/attendance`(ゲスト出欠回答PATCH) | 同上。`share_token`でプランを引き、`plan_id`一致の`manual_plan_members`のみ更新 | RLSバイパス。トークンを知っていることが唯一の認可根拠(後述 Medium) |

いずれも「トークンを知っていること」を認可根拠とするcapabilityベースの設計で一貫しており、**RLSポリシー自体に匿名アクセス用の穴を開けていない**(`share_tokens`の1件を除く)。これは望ましい設計。

---

## リスク詳細(Phase 2)

### 🔴 Critical — `share_tokens` の SELECT ポリシーが全公開(全行読み取り可能)

- 該当ファイル: `supabase/migrations/20260101000000_pdf_share.sql:62`
  ```sql
  create policy "anyone view share" on public.share_tokens for select using (true);
  ```
- **問題**: `USING (true)` かつロール指定(`TO`)なしのため、`anon`ロール(公開されている `NEXT_PUBLIC_SUPABASE_ANON_KEY` を使う誰でも)が Supabase REST API 経由で
  `GET {SUPABASE_URL}/rest/v1/share_tokens?select=*`
  を直接叩くと、**全ユーザー分の `token` / `history_id` / `user_id` / `expires_at` / `view_count` が丸ごと取得できる**。
  - `token` はランダムな12桁nanoid(≒60bit)で単体では推測困難だが、このポリシーがある限り推測する必要がない。全トークンが一覧で漏れる。
  - これにより、任意の攻撃者が全ユーザーの共有履歴ページ(`/share/[token]`)へアクセス可能になり、「共有した相手にだけ見せる」というトークンの秘匿モデルが完全に無効化される。
  - `user_id` の一覧漏洩自体も、他ポリシー(例: `payment_settings`)への攻撃(後述 High)の「対象ユーザーIDを知る」下準備に使われうる。
- **アプリコード側の裏付け**: `app/share/[token]/page.tsx` と `app/api/share/[token]/route.ts` はどちらも `createAdminClient()`(service-role, RLSバイパス)経由で1件だけ取得しており、**anon向けSELECTポリシーはアプリのどこからも使われていない**(全文検索で確認済み)。つまりこのポリシーは実害しかなく、削除しても機能への影響はゼロ。
- 実は `manual_plans`(新しい方の共有機能)を実装した際のコミットで、まさにこの「`using (true)` は全ユーザーのデータ漏洩を招く」というリスクが `20260710000000_manual_plans.sql:73-80` のコメントで明記されており、`manual_plans` 側ではあえて公開SELECTポリシーを追加しなかった。しかし、同じリスクパターンが先行テーブルの `share_tokens` に残ったままになっている。
- **推奨**: このポリシーを削除する(→ Phase 4 の修正マイグレーションに含む)。

### 🟠 High — `payment_settings` の UPDATE ポリシーに `WITH CHECK` がなく、行の所有者(`user_id`)を書き換えられる

- 該当ファイル: `supabase/migrations/20260101000000_pdf_share.sql:24`
  ```sql
  create policy "update own payment" on public.payment_settings for update using (auth.uid() = user_id);
  ```
- **問題**: `USING` 句は「更新対象として選べる行」しか制限しない。`WITH CHECK` がないため、UPDATE後の新しい行の値には制約がかからず、**自分の行の `user_id` を他人のUUIDに書き換えることができる**。
  - 被害者がまだ `payment_settings` 行を持っていない場合(`unique(user_id)` に抵触しない場合)、攻撃者は自分の行の `user_id` を被害者のIDに更新するだけで、被害者が自分の設定画面(`/api/payment-settings` GET, `.eq("user_id", user.id)`)を開いた際に**攻撃者が用意した銀行口座・PayPay/LINE Pay情報が「自分の集金設定」として表示されてしまう**。Kanjiiは会費徴収のための口座情報を扱うため、これは金銭的被害に直結しうる。
  - 悪用には被害者の `auth.users.id`(UUID)を事前に知る必要があり、通常は外部から取得困難なため実際の悪用難度は高いが、`WITH CHECK` 欠落は典型的なRLSアンチパターンであり、修正コストが低いため是正すべき。
- **推奨**: `WITH CHECK (auth.uid() = user_id)` を追加(→ Phase 4)。

### 🟡 Medium — ゲスト出欠回答APIが「他人の回答」も書き換え可能

- 該当ファイル: `app/api/share/plan/[token]/attendance/route.ts:33-39`
- **内容**: このAPIは `share_token` の一致のみを認可根拠とし、リクエストで渡された任意の `member_id`(そのプラン内であれば誰の行でも)の `attendance_status` を更新できる。1つの共有URLをグループ全員に配る設計上、参加者ごとの個別シークレットが存在しないため、リンクを知っている誰か1人が他の参加者の出欠を勝手に「不参加」に変える、といった改ざんが可能。
- **判定根拠**: RLSではなくアプリ側の認可ロジック(admin client + トークン一致)なので直接のRLS不備ではないが、監査対象の「匿名アクセス経路が意図通りか」チェック項目に該当するため記録。データの機密性(閲覧)には影響せず、整合性(誰の回答か)にのみ影響する低〜中リスク。
- **推奨(任意)**: カジュアルな幹事ツールとしては許容範囲の設計判断だが、厳密にしたい場合はメンバー行ごとに個別トークン/URLを発行する方式への変更を検討。今回の修正マイグレーションには含めない(RLSの問題ではないため)。

### 🟡 Medium — `manual_plans.is_shared` フラグが未使用で、共有ページのアクセス制御に反映されていない

- 該当ファイル: `supabase/migrations/20260710120000_share_status.sql`(列追加)、`app/share/plan/[token]/page.tsx`、`app/api/share/plan/[token]/ics/route.ts`(どちらも `is_shared` を参照せず `share_token` 一致のみで応答)
- **内容**: マイグレーションのコメントには「既存ユーザーは詳細ページで『共有を開始する』を押して `is_shared=true` にする運用」と書かれているが、アプリコード全体を検索しても `is_shared` を読み書きする箇所は皆無(`grep is_shared` → 0件、UIに該当ボタンなし)。結果として、**プラン作成直後(下書きのつもり)でも `share_token` さえ知っていれば常に閲覧・ICS取得が可能**であり、「公開/非公開の切り替え」という意図された挙動は現状機能していない。
- **リスク**: `share_token` はランダムなUUIDで外部に漏れない限り実害は小さいが、「is_sharedがfalseなら非公開のはず」という誤った前提で運用判断をしないよう注意が必要。RLSポリシー自体の不備ではないためPhase 4の対象外とするが、ドキュメント化推奨。
- **推奨(任意)**: `is_shared` を使う設計にするなら両ルートに `.eq("is_shared", true)` を追加、使わないなら列とコメントを整理してこの意図のずれを解消する。

### 🟡 Medium — 全ポリシーで `TO authenticated` / `TO anon` のロール明示がない

- 該当箇所: 6テーブル・24ポリシーすべて
- **内容**: どのポリシーも `TO` 句を指定しておらず、暗黙的に `public`(=全ロール)に適用されている。`auth.uid()` が未ログイン時に `NULL` を返すため、現状は `auth.uid() = user_id` の等価比較が自動的にfalseになり実害はないが、ベストプラクティスとしてはロールを明示すべき(意図しない緩和に気づきにくくなるため)。
- **推奨**: 影響範囲が広く緊急性が低いため、Phase 4の必須修正には含めない。次回のスキーマ変更時に合わせて `TO authenticated` を明示していくことを推奨。

---

## 良好点(Info)

### 🟢 Service Role Key の使用箇所は最小限かつ用途が一貫している

`lib/supabase/admin.ts` を import しているのは以下5ファイルのみ、すべて「共有トークン一致の1件のみ操作する公開ページ/API」という同一パターン:

- `app/share/[token]/page.tsx`
- `app/api/share/[token]/route.ts`
- `app/share/plan/[token]/page.tsx`
- `app/api/share/plan/[token]/attendance/route.ts`
- `app/api/share/plan/[token]/ics/route.ts`

認証済みユーザー向けのCRUD(`app/api/manual-plans/*`, `app/api/payment-settings/*`, `app/api/history/*` 等)はすべてセッション連動の `createClient()`(`lib/supabase/server.ts`)を使っており、RLSが正しく効く経路になっている。Service Role Keyの乱用は見られない。

### 🟢 `history` テーブルにUPDATEポリシーが無いのは仕様通り

アプリコードのどこにも `history` に対する `.update()` 呼び出しがなく、RLS有効下でポリシー不在=更新は常に拒否される。意図した「作成後は不変」の設計と一致しており問題なし。

### 🟢 `/manual-plans*` は `middleware.ts` の `PROTECTED_ROUTES` に含まれないが、二重に保護されている

`lib/supabase/middleware.ts` の `PROTECTED_ROUTES` リストに `/manual-plans` は含まれていない。ただし対象の4ページ(`app/manual-plans/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`、および `new` フォーム)はすべてページ内で `auth.getUser()` → 未ログインなら `redirect("/login...")` を行っており、加えてDBクエリも `.eq("user_id", user.id)` とRLSの両方で二重に所有者チェックされている。ミドルウェアのリストにこのプレフィックスが漏れていても、RLSが独立した最終防衛線として機能する設計になっている。

### 🟢 共有トークンのランダム性は十分

- `history`/`share_tokens`: `nanoid` custom alphabet(33文字)× 12桁 ≒ 60bit(`lib/share/link.ts:6`)
- `manual_plans.share_token`: `gen_random_uuid()` ≒ 122bit(`supabase/migrations/20260710000000_manual_plans.sql:38`)

どちらも総当たりで現実的に推測不可能な強度。

---

## Service Role Key 使用箇所まとめ

| ファイル | 用途 | リスク評価 |
|---|---|---|
| `app/share/[token]/page.tsx` | history共有ページの表示 + 閲覧数カウント更新 | 🟢 トークン一致1件のみ。妥当 |
| `app/api/share/[token]/route.ts` | 同上のAPI版 | 🟢 同上 |
| `app/share/plan/[token]/page.tsx` | manual_plans共有ページの表示 | 🟢 同上 |
| `app/api/share/plan/[token]/attendance/route.ts` | ゲスト出欠回答の更新 | 🟡 トークン一致は妥当だが、メンバー単位の認可がない(前述Medium) |
| `app/api/share/plan/[token]/ics/route.ts` | 公開ICSダウンロード | 🟢 トークン一致1件のみ。妥当 |

---

## 推奨アクション(優先度順)

1. 🔴 **[Critical]** `share_tokens` の `"anyone view share"` ポリシー(`using (true)`)を削除する。アプリはservice-roleクライアントしか使っておらず、削除しても機能に影響しない。
2. 🟠 **[High]** `payment_settings` の UPDATE ポリシーに `WITH CHECK (auth.uid() = user_id)` を追加し、行の所有者付け替えを防ぐ。
3. 🟡 **[Medium・任意]** `manual_plans.is_shared` を実際にアクセス制御へ組み込むか、使わないなら列/コメントを整理して意図のずれを解消する。
4. 🟡 **[Medium・任意]** ゲスト出欠回答APIをメンバー単位の認可に強化する(現状の「共有リンク=グループ全体の編集権」という設計が許容できるかをプロダクト判断として確認)。
5. 🟡 **[Medium・任意]** 次回のスキーマ変更時に、全ポリシーへ `TO authenticated` / `TO anon` を明示していく。

---

## 修正マイグレーション

Critical・Highが存在するため、`supabase/migrations/20260712130000_fix_rls.sql` を作成した(1・2の修正のみを含む、最小差分)。**未適用**。適用にはユーザー自身の判断で `supabase db push` を実行すること。
