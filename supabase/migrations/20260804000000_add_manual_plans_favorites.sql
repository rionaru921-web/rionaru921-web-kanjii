-- 幹事ラボ Wave 22: 「よく使うプラン」機能
--
-- ⚠️ 本マイグレーションは Supabase CLI 経由で自動適用されていません。
--    Supabase Dashboard の SQL Editor で手動適用してください。
--    適用後、CLI側のマイグレーション履歴の辻褄を合わせるため
--    `supabase migration repair --status applied 20260804000000` を実行してください。

-- 既存の lib/plan-templates.ts（イベント種類タイルのクイック入力プリセット、
-- コード内蔵の静的データ）とは別物。こちらは「幹事が実際に作った過去の
-- プランを複製して、日時だけ入れ替えてまた使う」ための機能で、
-- manual_plans の行そのものとして保存する。名前の衝突を避けるため
-- 「テンプレート」という語はコード・カラム名・UI文言のどこにも使わない。
--
-- 「よく使うプランとして保存」は既存プランのUPDATEではなく、内容を複製した
-- 新規行のINSERTとして実装する(既存の(進行中の)プランがマイプラン一覧から
-- 消えてしまう事故を防ぐため)。
alter table public.manual_plans
  add column if not exists is_favorite boolean not null default false,
  add column if not exists favorite_name text;

comment on column public.manual_plans.is_favorite is
  '「よく使うプラン」として保存された複製行かどうか。true の行は通常のプラン一覧には出さず、/manual-plans/favorites 専用一覧に表示する';
comment on column public.manual_plans.favorite_name is
  '「よく使うプラン」一覧での表示名。is_favorite=true の行にのみ設定される(通常プランでは null)';

create index if not exists idx_manual_plans_is_favorite
  on public.manual_plans(user_id, is_favorite);
