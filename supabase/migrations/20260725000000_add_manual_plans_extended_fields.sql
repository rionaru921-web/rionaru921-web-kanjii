-- 幹事ラボ Ver.2.1: プラン作成フォーム大改修に伴う拡張項目
--
-- ⚠️ 本マイグレーションは Supabase CLI 経由で自動適用されていません。
--    Supabase Dashboard の SQL Editor で手動適用してください。
--    適用後、CLI側のマイグレーション履歴の辻褄を合わせるため
--    `supabase migration repair --status applied 20260725000000` を実行してください。

-- ① イベント種類（フォーム第一章の選択タイル）。
--    既存 lib/plan-templates.ts の PLAN_TEMPLATES と id を1:1対応させ、
--    テンプレ選択とDB保存を二重管理しないようにする。
--    'other'(自由入力)を選んだ場合は event_type を保存しない(null)。
alter table public.manual_plans
  add column if not exists event_type text
    check (event_type is null or event_type in
      ('welcome', 'farewell', 'bonenkai', 'shinnenkai', 'birthday', 'anniversary', 'trip', 'other'));

-- ② 幹事のみが見る非公開メモ（サプライズ情報等）。
--    既存の memo / dietary_notes は共有ページ(app/share/plan/[token]/page.tsx)
--    で参加者にも表示される設計のため、event_note とは役割を明確に分離する。
--    アプリ側は event_note を共有ページ・PDF・ICS等、参加者向け出力に
--    一切含めないこと。
alter table public.manual_plans
  add column if not exists event_note text;

-- ③ 会場の追加情報・設備タグ
--    venue_url は既存カラムを流用(電話番号のみ新規)。
alter table public.manual_plans
  add column if not exists venue_phone text,
  add column if not exists venue_facilities jsonb not null default '[]'::jsonb;

-- ④ 二次会情報
alter table public.manual_plans
  add column if not exists nijikai_enabled boolean not null default false,
  add column if not exists nijikai_venue text,
  add column if not exists nijikai_budget integer,
  add column if not exists nijikai_url text,
  add column if not exists nijikai_start_time text; -- '22:00' 形式の自由文字列

-- ⑤ クリーンアップ: venue_map_url はフォーム・APIどちらからも一度も
--    書き込まれたことのない未使用カラム(地図はvenue_name+venue_addressから
--    動的生成する設計に統一済み)。
alter table public.manual_plans
  drop column if exists venue_map_url;

comment on column public.manual_plans.event_type is 'イベント種類プリセットのid。lib/plan-templates.tsのPLAN_TEMPLATESのidと対応';
comment on column public.manual_plans.event_note is '幹事のみが見る非公開メモ。共有ページ・PDF・ICS等、参加者が見る出力には含めないこと';
comment on column public.manual_plans.venue_facilities is '設備タグの配列。例: ["private_room","wifi","tv","karaoke","smoking_ok","smoking_no"]';
comment on column public.manual_plans.nijikai_start_time is '"22:00"形式の自由文字列。日付を伴わないため text 型';
