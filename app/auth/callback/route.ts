import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabaseの標準OAuthプロバイダ(Sign in with Apple等)向けPKCE code交換
// エンドポイント。`signInWithOAuth`の`redirectTo`がここを指す。
// LINEログインはSupabaseネイティブ対応ではないため、このルートは使わず
// 専用の app/api/auth/line/route.ts で完結する。
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
    console.error("OAuth code exchange error:", error);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
