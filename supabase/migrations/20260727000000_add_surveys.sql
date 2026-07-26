-- 幹事ラボ Wave 11-A: プラン準備アンケート機能
--
-- 幹事が「みんなの都合・希望を集める」ためのアンケート機能。既存のプラン
-- 作成(manual_plans)とは完全に別テーブルで疎結合、任意で連携可能。
-- 参加者はログイン不要で回答できる(ゲスト対応)。
--
-- 匿名アクセスの設計は manual_plans / share_tokens の教訓を踏襲する
-- (audit_report.md 参照): 「using (true) 系の公開SELECTポリシーは
-- 行全体を漏洩させる」ため、surveys / survey_responses には公開向けの
-- SELECT・INSERTポリシーを一切追加しない。slug 経由の公開取得・ゲスト
-- からの回答送信は、どちらも createAdminClient()(service-role, RLS
-- バイパス)を使い、アプリコード側で slug 一致1件のみに絞り込む
-- (app/api/share/plan/[token]/* と同一パターン)。

-- アンケート本体
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,

  -- 基本情報
  title text not null,
  description text,
  event_type text,  -- 'nomikai' | 'travel' | 'kangeikai' | 'sobetsukai' | 'birthday' | 'other'

  -- 質問設定(MVPは固定4質問、将来的にカスタム対応)
  ask_dates boolean not null default true,
  ask_budget boolean not null default true,
  ask_genre boolean not null default true,
  ask_attend boolean not null default true,

  -- 日程候補(JSONB: [{"date": "2026-08-15", "time_slot": "夜"}, ...])
  date_options jsonb not null default '[]'::jsonb,
  -- 予算候補(JSONB: ["3000", "5000", "8000"])
  budget_options jsonb not null default '[]'::jsonb,
  -- ジャンル候補(JSONB: ["居酒屋", "焼肉", "イタリアン"])
  genre_options jsonb not null default '[]'::jsonb,

  deadline timestamptz,

  status text not null default 'active'
    check (status in ('active', 'closed', 'archived')),

  -- 共有URL用スラッグ。既存の共有トークンと同じ強度・生成方式
  -- (lib/share/link.ts の nanoid, 33文字アルファベット×12桁≒60bit)を
  -- 再利用するため、DB側のデフォルト値は持たせずアプリ側で生成して
  -- 明示的にinsertする(share_tokens.token と同じ運用)。
  slug text not null unique,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.surveys enable row level security;

-- オーナーのみ読み書き可。公開SELECTポリシーは意図的に追加しない
-- (manual_plans と同じ設計。理由は同ファイルのコメント参照)。
drop policy if exists "Users can view own surveys" on public.surveys;
create policy "Users can view own surveys"
  on public.surveys for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert own surveys" on public.surveys;
create policy "Users can insert own surveys"
  on public.surveys for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own surveys" on public.surveys;
create policy "Users can update own surveys"
  on public.surveys for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete own surveys" on public.surveys;
create policy "Users can delete own surveys"
  on public.surveys for delete
  using (auth.uid() = owner_id);

create index if not exists idx_surveys_owner on public.surveys(owner_id, created_at desc);

drop trigger if exists surveys_updated_at on public.surveys;
create trigger surveys_updated_at
  before update on public.surveys
  for each row execute function public.handle_updated_at();


-- アンケート回答(追記のみ。respondentからの編集・削除は想定しない
-- ため UPDATE/DELETE ポリシーは作らない — history テーブルと同じ
-- 「作成後は不変」設計)
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,

  -- ログイン済(匿名認証含む)なら user_id、完全な未ログインゲストは null
  respondent_user_id uuid references auth.users(id) on delete set null,
  respondent_name text not null,
  respondent_email text,

  selected_dates jsonb not null default '[]'::jsonb,  -- 例: ["2026-08-15", "2026-08-16"]
  selected_budget text,
  selected_genre text,
  will_attend text check (will_attend in ('yes', 'no', 'maybe')),
  free_comment text,

  created_at timestamptz not null default now()
);

alter table public.survey_responses enable row level security;

-- 公開INSERTポリシーは追加しない。ゲストからの回答送信は
-- createAdminClient() 経由で、API側が slug→survey_id の存在確認と
-- status='active' / deadline 未超過をコードで検証してから insert する
-- (/api/share/plan/[token]/attendance と同一パターン)。

drop policy if exists "Survey owner can read responses" on public.survey_responses;
create policy "Survey owner can read responses"
  on public.survey_responses for select
  using (
    exists (
      select 1 from public.surveys
      where surveys.id = survey_responses.survey_id
        and surveys.owner_id = auth.uid()
    )
  );

drop policy if exists "Users can read own responses" on public.survey_responses;
create policy "Users can read own responses"
  on public.survey_responses for select
  using (auth.uid() = respondent_user_id);

create index if not exists idx_survey_responses_survey
  on public.survey_responses(survey_id, created_at desc);

-- このマイグレーションを適用するには、Supabase Dashboard の SQL Editor で
-- 全文を貼り付けて Run してください(supabase db push は password 未設定で
-- ハングします)。
-- 適用後: supabase migration repair --status applied 20260727000000
