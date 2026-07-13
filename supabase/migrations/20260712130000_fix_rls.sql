-- Kanjii RLS監査 (2026-07-12) で検出した Critical / High の是正
--
-- 1. [Critical] share_tokens の SELECT ポリシー "anyone view share" が
--    using (true) かつロール指定なしのため、公開されている anon キーで
--    `share_tokens?select=*` を直接叩くと全ユーザーのトークン・
--    history_id・user_id が丸ごと閲覧できてしまい、共有トークンの
--    秘匿性そのものが無効化される。アプリのコード
--    (app/share/[token]/page.tsx, app/api/share/[token]/route.ts) は
--    どちらも service-role の admin クライアント(RLSバイパス)で
--    token 一致1件だけを取得しており、anon 向け SELECT ポリシーは
--    元々使われていない — 単純に削除する(機能への影響なし)。
--
-- 2. [High] payment_settings の UPDATE ポリシーに WITH CHECK がなく、
--    自分の行の user_id を他ユーザーの UUID に書き換えることができた
--    (更新後、被害者が自分の集金設定を開くと攻撃者が仕込んだ銀行口座
--    情報が表示されてしまう)。WITH CHECK (auth.uid() = user_id) を
--    追加し、更新後も所有者が変わらないことを強制する。
--
-- どちらも既存の正常な操作(自分の設定の閲覧・保存、share_token 経由の
-- 共有ページ表示)には影響しない。

-- 1. share_tokens: 全件公開SELECTポリシーを削除
--    (admin client が RLS をバイパスして参照するため、anon 向け SELECT は不要)
drop policy if exists "anyone view share" on public.share_tokens;

-- 2. payment_settings: UPDATE に WITH CHECK を追加(冪等に張り替え)
drop policy if exists "update own payment" on public.payment_settings;
create policy "update own payment"
  on public.payment_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- このマイグレーションを適用するには `supabase db push` を実行してください。
-- 実行前に本番Supabaseのバックアップを取ることを推奨します。
