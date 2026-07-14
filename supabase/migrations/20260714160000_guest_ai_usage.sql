-- Kanjii Wave 5-C: ゲストログイン(お試しモード)の AI 呼び出し回数制限
--
-- Supabase Anonymous Auth を使ったゲストは通常ユーザーと同じ auth.users.id
-- を持つため、既存テーブルのRLS (auth.uid() = user_id) はそのまま機能する。
-- ただし「AI提案を生涯3回まで」という制限は既存テーブルのどこにも記録先
-- がないため、この専用カウンタテーブルを追加する。
--
-- 書き込みは /api/ai/suggest (service-roleクライアント経由) のみが行う
-- 前提のため、INSERT/UPDATE のRLSポリシーはあえて追加しない — クライアント
-- から直接カウンタを書き換えられると回数制限自体が無意味になるため。
-- 本人による残り回数の参照(SELECT)のみ許可する。

create table if not exists public.guest_ai_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  used_count integer not null default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.guest_ai_usage enable row level security;

drop policy if exists "Users can view own ai usage" on public.guest_ai_usage;
create policy "Users can view own ai usage"
  on public.guest_ai_usage for select
  using (auth.uid() = user_id);

-- updated_at自動更新(20260101000001_profiles.sql で定義済みの
-- handle_updated_at() を再利用)
drop trigger if exists guest_ai_usage_updated_at on public.guest_ai_usage;
create trigger guest_ai_usage_updated_at
  before update on public.guest_ai_usage
  for each row execute function public.handle_updated_at();

-- このマイグレーションを適用するには `supabase db push` を実行してください。
-- 実行前に本番Supabaseのバックアップを取ることを推奨します。
