-- 幹事ラボ: Premiumプラン事前登録(需要検証用)
--
-- profiles.plan_tier / premium_expires_at (20260716180000) はまだ課金導線が
-- ないデータ構造のみの基盤。実際のPremium提供時期を判断するため、興味の
-- ある登録ユーザーを先に集めておく。ゲスト(匿名)は登録直後にデータが
-- 消えるアカウントなので対象外(app/api/premium/waitlist/route.ts側で弾く)。

create table if not exists public.premium_waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  interest_reason text,
  created_at timestamp with time zone default now() not null,
  unique (user_id)
);

alter table public.premium_waitlist enable row level security;

drop policy if exists "Users can join waitlist once" on public.premium_waitlist;
create policy "Users can join waitlist once"
  on public.premium_waitlist for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view own waitlist entry" on public.premium_waitlist;
create policy "Users can view own waitlist entry"
  on public.premium_waitlist for select
  using (auth.uid() = user_id);

-- このマイグレーションを適用するには `supabase db push` を実行してください。
-- 実行前に本番Supabaseのバックアップを取ることを推奨します。
