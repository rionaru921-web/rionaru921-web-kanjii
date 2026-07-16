-- 幹事ラボ Premium プラン基盤(Phase 1)
--
-- 実際の課金・制限適用はまだ実装しない。将来のPremiumプラン導入に備えた
-- データ構造のみを用意する。lib/plans/limits.ts の PlanTier と対になる。
--
-- profiles.is_premium (boolean) は既存カラムだが、どのAPI/画面からも参照
-- されていない未使用カラムのため、このマイグレーションでは触れない。
-- team プランのような3値以上の区分を見据え、新たに plan_tier を追加する。

alter table public.profiles
  add column if not exists plan_tier text
    not null default 'free'
    check (plan_tier in ('free', 'premium', 'team'));

alter table public.profiles
  add column if not exists premium_expires_at timestamp with time zone;

comment on column public.profiles.plan_tier is 'User plan: free / premium / team';
comment on column public.profiles.premium_expires_at is 'Premium expiration date, null for free users';

-- このマイグレーションを適用するには `supabase db push` を実行してください。
-- 実行前に本番Supabaseのバックアップを取ることを推奨します。
