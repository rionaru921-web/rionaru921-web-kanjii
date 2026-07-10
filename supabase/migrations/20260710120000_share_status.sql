-- Kanjii: 手動プランのステータスを「共有状態」中心に再設計
-- draft/confirmed/completed/cancelled という進捗管理的ステータスから、
-- is_shared(共有中かどうか)+ 時系列(フロントで event_date/end_date から
-- 自動判定、DBには保存しない)の2軸設計に移行する。

-- 既存のstatus列を撤廃し、is_sharedフラグを追加
alter table public.manual_plans
  add column if not exists is_shared boolean not null default false;

-- 既存プランは一律 is_shared=false(下書き)で初期化。
-- 既存ユーザーは詳細ページで「共有を開始する」を押して is_shared=true にする運用。
update public.manual_plans set is_shared = false;

-- status列は将来的に削除するが、今回はDROPせず残す(既存クライアントの互換性のため)。
-- 段階的に廃止するため、コード側では status を参照しないようにする。

-- インデックス
create index if not exists idx_manual_plans_is_shared on public.manual_plans(is_shared);
create index if not exists idx_manual_plans_event_date on public.manual_plans(event_date);
