import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const alt = "幹事ラボ プラン招待";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same non-subsetted Noto Sans JP woff as the other OG image routes —
// next/og's default font has no CJK glyphs, so Japanese text renders as
// blank boxes without this.
const NOTO_SANS_JP_URL =
  "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75g.woff";

const TYPE_LABEL: Record<string, string> = {
  nomikai: "飲み会のご招待",
  travel: "旅行のご招待",
};

export default async function ShareOGImage({ params }: { params: { token: string } }) {
  const supabase = createAdminClient();

  const [{ data: shareToken }, fontData] = await Promise.all([
    supabase.from("share_tokens").select("history_id").eq("token", params.token).maybeSingle(),
    fetch(NOTO_SANS_JP_URL).then((res) => res.arrayBuffer()),
  ]);

  const { data: history } = shareToken
    ? await supabase.from("history").select("title, type").eq("id", shareToken.history_id).maybeSingle()
    : { data: null };

  const title = history?.title ?? "幹事ラボ";
  const subtitle = history ? TYPE_LABEL[history.type] ?? "集まりのご招待" : "あらゆる集まりを、AIが幹事します";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #1F1B18 0%, #2A2420 100%)",
          fontFamily: "Noto Sans JP",
        }}
      >
        <svg width="96" height="128" viewBox="0 0 120 160">
          <rect x="46" y="18" width="28" height="13" rx="3.5" fill="#C4A56B" />
          <ellipse cx="60" cy="88" rx="49" ry="60" fill="#B85450" />
          <rect x="46" y="129" width="28" height="13" rx="3.5" fill="#C4A56B" />
        </svg>
        <div style={{ fontSize: 26, color: "#C4A56B", fontWeight: 700, marginTop: 28 }}>幹事ラボ</div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: "#F7F3EA",
            marginTop: 20,
            maxWidth: 960,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#8B8378", marginTop: 20 }}>{subtitle}</div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: fontData, weight: 400, style: "normal" }],
    }
  );
}
