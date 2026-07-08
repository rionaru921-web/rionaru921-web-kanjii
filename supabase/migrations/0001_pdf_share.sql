-- Kanjii P6: PDF generation + sharing
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).

-- 集金設定
create table public.payment_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  bank_name text,
  bank_branch text,
  bank_account_type text,
  bank_account_number text,
  bank_account_holder text,
  paypay_id text,
  line_pay_id text,
  memo text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

alter table public.payment_settings enable row level security;
create policy "view own payment" on public.payment_settings for select using (auth.uid() = user_id);
create policy "insert own payment" on public.payment_settings for insert with check (auth.uid() = user_id);
create policy "update own payment" on public.payment_settings for update using (auth.uid() = user_id);
create policy "delete own payment" on public.payment_settings for delete using (auth.uid() = user_id);

-- 履歴（飲み会・旅行の確定内容を保存。PDF再生成・共有ページ表示に使う）
--
-- 注: このテーブルはP6プロンプトのSQLには含まれていませんでした。しかし
-- share_tokens.history_id が参照する実体（店舗情報・参加者・割り勘結果な
-- ど）を保存する場所と、履歴詳細ページ（/history/[id]）が読み込むデータが
-- 元のスキーマには存在しなかったため、そのギャップを埋めるために追加して
-- います。JSONB payload に飲み会/旅行どちらのデータも保存する設計にして
-- あります（NomikaiPDFProps / TravelPDFProps とほぼ同じ形）。
create table public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('nomikai', 'travel')),
  title text not null,
  event_date text,
  payload jsonb not null,
  created_at timestamp with time zone default now()
);

alter table public.history enable row level security;
create policy "view own history" on public.history for select using (auth.uid() = user_id);
create policy "insert own history" on public.history for insert with check (auth.uid() = user_id);
create policy "delete own history" on public.history for delete using (auth.uid() = user_id);

-- 共有トークン
create table public.share_tokens (
  token text primary key,
  history_type text not null,
  history_id uuid not null,
  user_id uuid references auth.users on delete cascade not null,
  expires_at timestamp with time zone,
  view_count integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.share_tokens enable row level security;
create policy "anyone view share" on public.share_tokens for select using (true);
create policy "insert own share" on public.share_tokens for insert with check (auth.uid() = user_id);
create policy "delete own share" on public.share_tokens for delete using (auth.uid() = user_id);
