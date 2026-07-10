-- Kanjii: 手動作成プラン機能 (Phase A)
-- 自分で決めた予定を作成・共有するための独立機能。既存のAI提案フロー
-- (nomikai / travel / history) とは完全に別テーブルで、干渉しない。

create table if not exists public.manual_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,

  -- 基本情報
  title text not null,
  event_date timestamp with time zone,
  end_date timestamp with time zone,

  -- 場所
  venue_name text,
  venue_address text,
  venue_url text,
  venue_map_url text,

  -- 予算・集金
  fee_amount integer,
  payment_methods jsonb not null default '[]'::jsonb,
  payment_deadline timestamp with time zone,

  -- メモ・備考
  memo text,
  dietary_notes text,

  -- ステータス
  status text not null default 'draft'
    check (status in ('draft', 'confirmed', 'completed', 'cancelled')),

  -- 共有トークン(URL共有用)。history の share_tokens とは別のURL空間
  -- (/share/plan/[token]) で公開する。RLSでは公開読み取りを許可しない —
  -- 公開ページ (app/share/plan/[token]/page.tsx) は lib/supabase/admin.ts
  -- の service-role クライアントで share_token 一致の1件だけを取得する
  -- (history の /share/[token] と同じ設計)。
  share_token text unique not null default replace(gen_random_uuid()::text, '-', ''),

  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- メンバー(参加者)テーブル
create table if not exists public.manual_plan_members (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.manual_plans(id) on delete cascade not null,

  name text not null,
  email text,
  attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'attending', 'declined', 'maybe')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid')),
  note text,

  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- インデックス
create index if not exists idx_manual_plans_user_id on public.manual_plans(user_id);
create index if not exists idx_manual_plans_share_token on public.manual_plans(share_token);
create index if not exists idx_manual_plans_status on public.manual_plans(status);
create index if not exists idx_manual_plan_members_plan_id on public.manual_plan_members(plan_id);

-- RLS
alter table public.manual_plans enable row level security;
alter table public.manual_plan_members enable row level security;

-- ポリシー: manual_plans (作成者本人のみ読み書き可)
--
-- 注意: あえて「誰でも share_token で読める」という using (true) の SELECT
-- ポリシーは追加していない。share_tokens テーブルは token→id の対応表に
-- すぎないので using (true) でも実害はないが、manual_plans は会費・住所・
-- メモ等の実データそのものを持つテーブルなので、using (true) を付けると
-- anon キーで `manual_plans?select=*` を直接叩かれた際に全ユーザーの
-- プランデータが漏洩してしまう。公開共有ページは admin クライアント
-- (service-role, RLSバイパス) で share_token 一致の1件だけを読む設計に
-- してあるため、ここでは公開ポリシーは不要。
drop policy if exists "Users can view own plans" on public.manual_plans;
create policy "Users can view own plans"
  on public.manual_plans for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own plans" on public.manual_plans;
create policy "Users can insert own plans"
  on public.manual_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own plans" on public.manual_plans;
create policy "Users can update own plans"
  on public.manual_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own plans" on public.manual_plans;
create policy "Users can delete own plans"
  on public.manual_plans for delete
  using (auth.uid() = user_id);

-- ポリシー: manual_plan_members (プラン所有者のみ読み書き可)
-- 公開共有ページはメンバー一覧を表示しない仕様のため、公開ポリシーは不要。
drop policy if exists "Plan owner can view members" on public.manual_plan_members;
create policy "Plan owner can view members"
  on public.manual_plan_members for select
  using (
    exists (
      select 1 from public.manual_plans
      where manual_plans.id = manual_plan_members.plan_id
        and manual_plans.user_id = auth.uid()
    )
  );

drop policy if exists "Plan owner can insert members" on public.manual_plan_members;
create policy "Plan owner can insert members"
  on public.manual_plan_members for insert
  with check (
    exists (
      select 1 from public.manual_plans
      where manual_plans.id = manual_plan_members.plan_id
        and manual_plans.user_id = auth.uid()
    )
  );

drop policy if exists "Plan owner can update members" on public.manual_plan_members;
create policy "Plan owner can update members"
  on public.manual_plan_members for update
  using (
    exists (
      select 1 from public.manual_plans
      where manual_plans.id = manual_plan_members.plan_id
        and manual_plans.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.manual_plans
      where manual_plans.id = manual_plan_members.plan_id
        and manual_plans.user_id = auth.uid()
    )
  );

drop policy if exists "Plan owner can delete members" on public.manual_plan_members;
create policy "Plan owner can delete members"
  on public.manual_plan_members for delete
  using (
    exists (
      select 1 from public.manual_plans
      where manual_plans.id = manual_plan_members.plan_id
        and manual_plans.user_id = auth.uid()
    )
  );

-- updated_at自動更新(既存の handle_updated_at() を再利用。
-- 20260101000001_profiles.sql で定義済みのため、ここでは作成しない)
drop trigger if exists manual_plans_updated_at on public.manual_plans;
create trigger manual_plans_updated_at
  before update on public.manual_plans
  for each row execute function public.handle_updated_at();

drop trigger if exists manual_plan_members_updated_at on public.manual_plan_members;
create trigger manual_plan_members_updated_at
  before update on public.manual_plan_members
  for each row execute function public.handle_updated_at();
