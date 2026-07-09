import { createClient } from "@/lib/supabase/server";
import HeaderNav from "./HeaderNav";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user
    ? user.user_metadata?.full_name || user.email?.split("@")[0] || "ゲスト"
    : null;

  return <HeaderNav isLoggedIn={!!user} displayName={displayName} />;
}
