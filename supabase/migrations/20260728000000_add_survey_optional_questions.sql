-- 幹事ラボ Wave 11-A2: アンケートテンプレフルパワー拡張
--
-- Wave 11-A の surveys / survey_responses に、既存カラムはそのままで
-- 追加質問・参加意思の詳細情報を保持する列を追加する。列追加のみのため
-- 既存のRLSポリシー(所有者のみ読み書き、公開ポリシーなし)には影響しない。

-- 幹事が任意で追加した質問のセット。
-- 構造: [{ "id": "allergy", "label": "...", "type": "text"|"select"|"multi_select"|"yes_no", "options": [...] | null }]
alter table public.surveys
  add column if not exists optional_questions jsonb not null default '[]'::jsonb;

-- 追加質問への回答。survey.optional_questions[].id をキーとするオブジェクト。
-- 構造: { "allergy": "エビとカニがダメです", "nijikai": "yes" }
alter table public.survey_responses
  add column if not exists optional_answers jsonb not null default '{}'::jsonb;

-- 参加意思(will_attend, 既存3値)を変更せず追加する詳細情報。
-- 構造: { "kind": "full"|"late"|"leave_early"|"undecided", "arrival_time": "20:00"|null, "leave_time": null, "will_confirm_later": true|false }
alter table public.survey_responses
  add column if not exists attendance_detail jsonb;

-- このマイグレーションを適用するには、Supabase Dashboard の SQL Editor で
-- 全文を貼り付けて Run してください(supabase db push は password 未設定で
-- ハングします)。
-- 適用後: supabase migration repair --status applied 20260728000000
