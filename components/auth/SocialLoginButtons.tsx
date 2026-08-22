import AppleLoginButton from "@/components/auth/AppleLoginButton";
import LineLoginButton from "@/components/auth/LineLoginButton";

// Supabase Dashboard側のApple OAuthプロバイダ設定、LINE Developers
// Consoleでのチャネル作成が完了するまでは両方 false のままにしておく
// (未設定のままボタンを踏むとエラーになるため)。設定手順は
// docs/wave-29-w-v4-line-login-setup.md を参照。
const APPLE_LOGIN_ENABLED = process.env.NEXT_PUBLIC_APPLE_LOGIN_ENABLED === "true";
const LINE_LOGIN_ENABLED = process.env.NEXT_PUBLIC_LINE_LOGIN_ENABLED === "true";

export default function SocialLoginButtons({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  if (!APPLE_LOGIN_ENABLED && !LINE_LOGIN_ENABLED) return null;

  return (
    <div className="flex flex-col gap-2 mb-4">
      {APPLE_LOGIN_ENABLED && <AppleLoginButton redirectTo={redirectTo} />}
      {LINE_LOGIN_ENABLED && <LineLoginButton redirectTo={redirectTo} />}
      <div className="flex items-center gap-3 mt-2">
        <span className="h-px flex-1 bg-gold/15" />
        <span className="text-xs text-ink-muted">または</span>
        <span className="h-px flex-1 bg-gold/15" />
      </div>
    </div>
  );
}
