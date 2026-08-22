import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildLineAuthorizeUrl,
  exchangeLineCodeForToken,
  generateRandomToken,
  isLineLoginConfigured,
  syntheticLineEmail,
  verifyLineIdToken,
} from "@/lib/auth/line-login";

const STATE_COOKIE = "line_oauth_state";
const NONCE_COOKIE = "line_oauth_nonce";

// このルートは2役を兼ねる:
// - `code`/`state` クエリなし → LINEログイン開始(認可URLへリダイレクト)
// - `code`/`state` あり       → LINEからのcallbackを受け取り、Supabaseセッションへ橋渡し
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  if (!isLineLoginConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=line_not_configured`);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return startLineLogin(origin, redirectTo);
  }

  return handleLineCallback(request, origin, code, state);
}

function startLineLogin(origin: string, redirectTo: string) {
  const state = generateRandomToken();
  const nonce = generateRandomToken();
  const authorizeUrl = buildLineAuthorizeUrl(state, nonce);

  const response = NextResponse.redirect(authorizeUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };
  response.cookies.set(STATE_COOKIE, `${state}:${redirectTo}`, cookieOptions);
  response.cookies.set(NONCE_COOKIE, nonce, cookieOptions);
  return response;
}

async function handleLineCallback(
  request: NextRequest,
  origin: string,
  code: string,
  state: string
) {
  const storedState = request.cookies.get(STATE_COOKIE)?.value;
  const storedNonce = request.cookies.get(NONCE_COOKIE)?.value;
  const [expectedState, redirectTo] = (storedState || "").split(":");

  if (!storedState || !storedNonce || state !== expectedState) {
    return clearStateCookies(NextResponse.redirect(`${origin}/login?error=line_state_mismatch`));
  }

  try {
    const tokenResponse = await exchangeLineCodeForToken(code);
    const profile = await verifyLineIdToken(tokenResponse.id_token, storedNonce);
    const email = profile.email || syntheticLineEmail(profile.sub);

    const admin = createAdminClient();

    // 初回ログイン時のみユーザーを作成。2回目以降は「既に登録済み」エラーを
    // 無視してそのまま次のステップ(セッション発行)へ進む。
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        provider: "line",
        line_user_id: profile.sub,
        name: profile.name,
        picture: profile.picture,
      },
    });
    if (createError && !createError.message.includes("already been registered")) {
      throw createError;
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkError || !linkData?.properties?.hashed_token) {
      throw linkError || new Error("Failed to generate Supabase session link");
    }

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: "magiclink",
      token_hash: linkData.properties.hashed_token,
    });
    if (verifyError) throw verifyError;

    return clearStateCookies(NextResponse.redirect(`${origin}${redirectTo || "/dashboard"}`));
  } catch (err) {
    console.error("LINE login error:", err);
    return clearStateCookies(NextResponse.redirect(`${origin}/login?error=line_login_failed`));
  }
}

function clearStateCookies(response: NextResponse) {
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(NONCE_COOKIE);
  return response;
}
