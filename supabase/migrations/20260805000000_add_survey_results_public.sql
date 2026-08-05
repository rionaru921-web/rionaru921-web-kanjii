-- 幹事ラボ Wave 26: アンケート集計の回答者向け公開

-- 回答者にも集計を見せる公開ページ(/s/[slug]/results)を出すかどうかの
-- フラグ。デフォルト true(公開)。個別回答(誰が何を答えたか)は元々
-- SurveyResultsView 側で一切表示しない設計のため、このフラグは
-- 「集計ページごと出す/出さない」のオン・オフのみを制御する。
alter table public.surveys
  add column if not exists results_public boolean not null default true;

comment on column public.surveys.results_public is
  '集計(/s/[slug]/results)を回答者にも公開するか。デフォルト公開、幹事が非公開に切替可能';

-- このマイグレーションを適用するには、Supabase Dashboard の SQL Editor で
-- 全文を貼り付けて Run してください(supabase db push は password 未設定で
-- ハングします)。
-- 適用後: supabase migration repair --status applied 20260805000000
