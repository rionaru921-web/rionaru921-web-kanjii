-- manual_plan_members を supabase_realtime パブリケーションに追加し、
-- Postgres Changes (UPDATE) を購読可能にする。
-- RLS ("Plan owner can view members", 20260710000000_manual_plans.sql) は
-- Realtime にもそのまま適用されるため、他人のプランのメンバー変更が
-- 漏れることはない。
--
-- 適用は Supabase Dashboard の SQL Editor で手動実行すること。
-- `supabase db push` は使用しない。

BEGIN;

ALTER PUBLICATION supabase_realtime ADD TABLE manual_plan_members;

COMMIT;
