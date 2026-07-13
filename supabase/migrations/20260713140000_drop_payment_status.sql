-- Kanjii: 手動プランの「集金ステータス管理」機能を削除
--
-- 削除するのはメンバーごとの支払い状態(未払い/支払い済み)の記録のみ。
-- 集金設定そのもの(口座情報表示・会費内訳・支払い方法・支払い期限・
-- 費用按分計算)は manual_plans 側のカラム(fee_amount, fee_breakdown,
-- payment_methods, payment_deadline)であり、このマイグレーションでは
-- 一切変更しない。
--
-- payment_status を書き込むAPI経路は存在せず(DBのデフォルト値
-- 'unpaid' のまま運用されていた)、業務的な意味を持つデータは
-- 入っていないため、既存データの退避処理は行わない。
alter table public.manual_plan_members
  drop column if exists payment_status;
