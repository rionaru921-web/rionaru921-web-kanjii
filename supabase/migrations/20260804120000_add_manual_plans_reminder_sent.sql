-- 幹事ラボ Wave 23: 開催前日リマインダー通知
--
-- ⚠️ 本マイグレーションは Supabase CLI 経由で自動適用されていません。
--    Supabase Dashboard の SQL Editor で手動適用してください。
--    適用後、CLI側のマイグレーション履歴の辻褄を合わせるため
--    `supabase migration repair --status applied 20260804120000` を実行してください。

-- 開催前日 20:00(JST)の cron (/api/cron/send-reminders) が、このフラグが
-- false の行だけを対象にリマインダーメールを送信し、送信後に true へ更新
-- する。event_date 自体は変わらないため、重複送信防止の唯一の手段。
alter table public.manual_plans
  add column if not exists reminder_sent boolean not null default false;

comment on column public.manual_plans.reminder_sent is
  '開催前日リマインダーメールを送信済みかどうか(cron の重複送信防止用)';

-- cron のクエリ (is_favorite = false and reminder_sent = false and
-- event_date が明日の範囲)を効率化するための複合インデックス。
create index if not exists idx_manual_plans_reminder_pending
  on public.manual_plans(event_date, reminder_sent)
  where is_favorite = false;
