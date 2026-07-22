-- 幹事ラボ: 登録ユーザー向け AI利用回数の月次トラッキング
--
-- ゲスト(匿名)は guest_ai_usage で生涯3回までを追跡しているが、登録ユーザー
-- は消えないアカウントを持つため「生涯」ではなく year_month 単位でリセット
-- される月次カウンタとして別テーブルに記録する。plan_tier が free の
-- ユーザーのみ実際に制限が適用される(lib/plans/limits.ts の
-- PLAN_LIMITS.free.maxAiSuggestionsPerMonth) — premium/team は
-- maxAiSuggestionsPerMonth = -1 のためカウントはするが上限判定はスキップ。
--
-- guest_ai_usage と同じ理由で、書き込みは /api/ai/suggest
-- (service-roleクライアント経由、lib/plans/checkAiUsage.ts) のみが行う前提
-- のため、INSERT/UPDATE の RLS ポリシーはあえて追加しない。本人による
-- 参照(SELECT)のみ許可する。

create table if not exists public.user_ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  year_month text not null, -- 'YYYY-MM' 形式
  count integer not null default 0,
  updated_at timestamp with time zone default now() not null,
  primary key (user_id, year_month)
);

alter table public.user_ai_usage enable row level security;

drop policy if exists "Users can view own ai usage" on public.user_ai_usage;
create policy "Users can view own ai usage"
  on public.user_ai_usage for select
  using (auth.uid() = user_id);

drop trigger if exists user_ai_usage_updated_at on public.user_ai_usage;
create trigger user_ai_usage_updated_at
  before update on public.user_ai_usage
  for each row execute function public.handle_updated_at();

-- このマイグレーションを適用するには `supabase db push` を実行してください。
-- 実行前に本番Supabaseのバックアップを取ることを推奨します。
