-- 幹事ラボ: AI幹事コーチ機能
--
-- 完了した飲み会・旅行・手動プランをAIと対話形式で振り返るための
-- セッションデータを保存する。1プラン1セッション制。
-- AI使用量は既存 user_ai_usage テーブルに統合カウント(1セッション完了=1回)。
--
-- plan_id は plan_type に応じて history.id (nomikai/travel) または
-- manual_plans.id (manual) を指す。参照先テーブルが異なるため外部キー
-- 制約は張らず、所有権・存在チェックはアプリ側(lib/coaching/planContext.ts)
-- で行う。

create table if not exists public.coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- 対象プラン
  plan_type text not null check (plan_type in ('nomikai', 'travel', 'manual')),
  plan_id uuid not null,

  -- 対話ログ（JSONB配列）
  -- 例: [{"step":1, "question":"参加率は？", "answer":"90%", "answered_at":"..."}]
  qa_pairs jsonb not null default '[]'::jsonb,

  -- AIサマリー（すべての回答後に生成）
  ai_summary text,
  ai_strengths jsonb,       -- ["予算設定が的確", "お店選びが◯◯"]
  ai_improvements jsonb,    -- ["リマインドで参加率UP", "..."]

  -- 進捗管理
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),
  current_step integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,

  -- 1プラン1セッション制（再開のため unique）
  unique (user_id, plan_type, plan_id)
);

-- RLS
alter table public.coaching_sessions enable row level security;

drop policy if exists "Users can read own coaching sessions" on public.coaching_sessions;
create policy "Users can read own coaching sessions"
  on public.coaching_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own coaching sessions" on public.coaching_sessions;
create policy "Users can insert own coaching sessions"
  on public.coaching_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own coaching sessions" on public.coaching_sessions;
create policy "Users can update own coaching sessions"
  on public.coaching_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 成長履歴集計用インデックス
create index if not exists idx_coaching_user_completed
  on public.coaching_sessions(user_id, completed_at desc)
  where status = 'completed';

-- updated_at自動更新トリガー(既存の handle_updated_at() を再利用。
-- 20260101000001_profiles.sql で定義済みのため、ここでは作成しない)
drop trigger if exists coaching_sessions_updated_at on public.coaching_sessions;
create trigger coaching_sessions_updated_at
  before update on public.coaching_sessions
  for each row execute function public.handle_updated_at();

-- このマイグレーションを適用するには、Supabase Dashboard の SQL Editor で
-- 全文を貼り付けて Run してください（supabase db push は password 未設定でハングします）。
-- 適用後: supabase migration repair --status applied 20260724000000
