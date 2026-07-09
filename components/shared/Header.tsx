import { createClient } from "@/lib/supabase/server";
import HeaderNav from "./HeaderNav";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const displayName = user
    ? profile?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "ゲスト"
    : null;

  return <HeaderNav isLoggedIn={!!user} displayName={displayName} />;
}
