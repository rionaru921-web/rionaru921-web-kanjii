-- Kanjii: 手動プラン機能の拡張(役割区分・地図連携・会費内訳・ホットペッパー連携)

-- ① メンバー役割区分
alter table public.manual_plan_members
  add column if not exists role text not null default 'participant'
    check (role in ('organizer', 'participant'));

-- ② 場所情報の拡張(ホットペッパー選択時の緯度経度・店舗ID)
alter table public.manual_plans
  add column if not exists venue_lat numeric,
  add column if not exists venue_lng numeric,
  add column if not exists venue_hotpepper_id text;

-- ③ 会費の詳細内訳(JSON配列: [{ "label": "飲食代", "amount": 30000 }, ...])
alter table public.manual_plans
  add column if not exists fee_breakdown jsonb not null default '[]'::jsonb;
