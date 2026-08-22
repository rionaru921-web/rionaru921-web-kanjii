import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

// LINE Login v2.1 (OpenID Connect) の設定値。LINE Developers Console で
// チャネルを作成すると発行される。詳細セットアップ手順は
// docs/wave-29-w-v4-line-login-setup.md を参照。
const LINE_AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const LINE_JWKS_URL = "https://api.line.me/oauth2/v2.1/certs";
const LINE_ISSUER = "https://access.line.me";

const jwks = createRemoteJWKSet(new URL(LINE_JWKS_URL));

export function isLineLoginConfigured(): boolean {
  return !!(process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET && lineCallbackUrl());
}

function lineCallbackUrl(): string {
  return process.env.LINE_CALLBACK_URL || "";
}

export function generateRandomToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function buildLineAuthorizeUrl(state: string, nonce: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINE_CHANNEL_ID!,
    redirect_uri: lineCallbackUrl(),
    state,
    scope: "profile openid email",
    nonce,
  });
  return `${LINE_AUTHORIZE_URL}?${params.toString()}`;
}

interface LineTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeLineCodeForToken(code: string): Promise<LineTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: lineCallbackUrl(),
    client_id: process.env.LINE_CHANNEL_ID!,
    client_secret: process.env.LINE_CHANNEL_SECRET!,
  });

  const res = await fetch(LINE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`LINE token exchange failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export interface LineIdTokenPayload {
  sub: string;
  name?: string;
  picture?: string;
  email?: string;
}

// LINEのid_tokenをLINEの公開鍵(JWKS)で検証する。署名・issuer・audience(channel
// id)・nonceのすべてが一致しない限り成立しない — LINE側の
// https://api.line.me/oauth2/v2.1/verify エンドポイントを叩く方法もあるが、
// こちらはネットワーク往復が1回減り、Edge/Node両ランタイムで動く。
export async function verifyLineIdToken(
  idToken: string,
  expectedNonce: string
): Promise<LineIdTokenPayload> {
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: LINE_ISSUER,
    audience: process.env.LINE_CHANNEL_ID!,
  });

  if (payload.nonce !== expectedNonce) {
    throw new Error("LINE id_token nonce mismatch");
  }
  if (!payload.sub) {
    throw new Error("LINE id_token missing sub");
  }

  return {
    sub: payload.sub,
    name: typeof payload.name === "string" ? payload.name : undefined,
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
    email: typeof payload.email === "string" ? payload.email : undefined,
  };
}

// SupabaseはLINEをネイティブOAuthプロバイダとしてサポートしていないため、
// LINEのsubを鍵にした決定論的な内部メールアドレスでSupabaseユーザーを
// 一意に紐付ける。実際に送信されるメールではない(email_confirm: trueで
// 作成するため確認メール自体発生しない)。
export function syntheticLineEmail(lineSub: string): string {
  return `line-${lineSub}@line.kanji-lab.internal`;
}
