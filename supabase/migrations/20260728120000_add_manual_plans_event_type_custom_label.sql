-- 幹事ラボ Wave 14: イベント種類「自由入力」のカスタムラベル
--
-- ⚠️ 本マイグレーションは Supabase CLI 経由で自動適用されていません。
--    Supabase Dashboard の SQL Editor で手動適用してください。
--    適用後、CLI側のマイグレーション履歴の辻褄を合わせるため
--    `supabase migration repair --status applied 20260728120000` を実行してください。

-- event_type は 'welcome'|'farewell'|...|'other'|null の固定値のみ許可されており
-- (20260725000000_add_manual_plans_extended_fields.sql)、「自由入力」タイル選択時は
-- 常に null が保存される。これまでその場合の分類ラベルを保存する場所が無かったため、
-- 自由記述の1列を追加する。event_type が null のときのみ意味を持つ。
alter table public.manual_plans
  add column if not exists event_type_custom_label text;

comment on column public.manual_plans.event_type_custom_label is
  'イベント種類「自由入力」タイル選択時のカスタム分類ラベル。event_type が null のときのみ使用';
