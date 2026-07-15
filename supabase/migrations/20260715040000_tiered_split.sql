-- Kanjii Wave 5-A: 傾斜割り(tiered/weighted split)
--
-- manual_plans / manual_plan_members に「均等割り」以外の費用按分方式を
-- 追加する。既存の fee_amount ベースの均等割り計算(perPersonFee)は
-- 一切変更せず、split_mode = 'tiered' のときだけ新しい重み付け計算
-- (lib/manual-plans/calculate-split.ts) を使う。
--
-- tier_level は既存の role('organizer'|'participant', 幹事編集権限の有無)
-- とは完全に独立したフィールドである。同じ「幹事」という言葉でも意味が
-- 異なるため混同しないこと — role は権限、tier_level は費用按分の階級。
--
-- 新規追加カラムはすべて NOT NULL DEFAULT 付きの nullable-safe な変更の
-- ため、既存の owner-scoped RLS ポリシー(20260710000000_manual_plans.sql)
-- がそのまま適用範囲となる。20260713000000_add_guest_secret.sql の前例と
-- 同様、このマイグレーションでは RLS ポリシーの追加・変更は行わない。

alter table public.manual_plans
  add column if not exists split_mode text
    not null default 'equal'
    check (split_mode in ('equal', 'tiered'));

alter table public.manual_plans
  add column if not exists rounding_unit integer
    not null default 100
    check (rounding_unit in (100, 500, 1000));

alter table public.manual_plan_members
  add column if not exists tier_level text
    not null default 'peer'
    check (tier_level in ('organizer', 'boss', 'senior', 'peer', 'junior', 'newcomer'));

-- 0.0〜3.0 の範囲チェック。null は「上書きなし(tier_levelの既定値を使う)」
-- を表すため対象外。numeric(3,2) は -9.99〜9.99 を表現でき、0.0〜3.0の
-- 要件を満たす。
alter table public.manual_plan_members
  add column if not exists weight_override numeric(3, 2)
    check (weight_override is null or (weight_override >= 0 and weight_override <= 3.0));

alter table public.manual_plan_members
  add column if not exists organizer_discount text
    check (organizer_discount is null or organizer_discount in ('free', 'half', 'discount', 'none'));

-- organizer_discount は tier_level = 'organizer' のメンバーにのみ意味を
-- 持つ。アプリ側(API insert)でも tier_level != 'organizer' のときは
-- 常に null を送るが、DB側でも二重に担保しておく。単一カラムの
-- add column 句には複数カラム参照の check を書けないため、
-- add constraint ... not valid → validate constraint の2段階で追加する。
-- drop constraint if exists で本マイグレーションの再実行にも対応する。
alter table public.manual_plan_members
  drop constraint if exists manual_plan_members_organizer_discount_requires_organizer_tier;

alter table public.manual_plan_members
  add constraint manual_plan_members_organizer_discount_requires_organizer_tier
    check (organizer_discount is null or tier_level = 'organizer') not valid;

alter table public.manual_plan_members
  validate constraint manual_plan_members_organizer_discount_requires_organizer_tier;

comment on column public.manual_plans.split_mode is 'equal (均等割) or tiered (傾斜割)';
comment on column public.manual_plans.rounding_unit is '100, 500, or 1000 yen rounding, used only when split_mode=tiered';
comment on column public.manual_plan_members.tier_level is 'organizer/boss/senior/peer/junior/newcomer — cost-split tier, independent of role';
comment on column public.manual_plan_members.weight_override is 'overrides tier_level default weight if set (0.0 - 3.0)';
comment on column public.manual_plan_members.organizer_discount is 'discount type when tier_level=organizer (free/half/discount/none)';

-- 適用方法: `supabase db push` (本番プロジェクトにlink済みであること)。
-- 実行前に本番Supabaseのバックアップを取ることを推奨します。
