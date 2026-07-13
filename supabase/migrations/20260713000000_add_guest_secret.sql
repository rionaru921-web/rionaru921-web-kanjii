-- Kanjii: ゲスト出欠回答の「なりすまし更新」対策 (guest_secretクレームモデル)
--
-- 監査(audit_report.md)で指摘された Medium 「ゲスト出欠回答APIが同一
-- メンバー以外も更新可能」の是正。共有URLを知っているだけでは他人の
-- 出欠を書き換えられないよう、メンバーごとに一度だけ発行される
-- guest_secret を導入する。
--
-- 認可の実体は app/api/share/plan/[token]/{identify,attendance}/route.ts
-- 側(service-roleクライアント経由)にあり、この列自体にRLSポリシーの
-- 追加は不要 — ゲスト経路は元々RLSをバイパスする設計のため。

alter table public.manual_plan_members
  add column if not exists guest_secret uuid;

-- 同じ guest_secret が複数メンバーに紐づくことを防ぐ(発行時の一意性保証)。
-- null は「まだ誰も名乗り出ていない」状態を表すため対象外にする。
create unique index if not exists manual_plan_members_guest_secret_idx
  on public.manual_plan_members (guest_secret)
  where guest_secret is not null;

-- このマイグレーションを適用するには `supabase db push` を実行してください。
-- 実行前に本番Supabaseのバックアップを取ることを推奨します。
