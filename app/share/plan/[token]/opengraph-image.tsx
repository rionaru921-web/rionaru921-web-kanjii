import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const alt = "幹事ラボ プラン招待";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same non-subsetted Noto Sans JP woff as app/opengraph-image.tsx — next/og's
// default font has no CJK glyphs, so Japanese text renders as blank boxes
// without this.
const NOTO_SANS_JP_URL =
  "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75g.woff";

export default async function PlanOGImage({ params }: { params: { token: string } }) {
  const supabase = createAdminClient();
  const [{ data: plan }, fontData] = await Promise.all([
    supabase.from("manual_plans").select("title, venue_name").eq("share_token", params.token).maybeSingle(),
    fetch(NOTO_SANS_JP_URL).then((res) => res.arrayBuffer()),
  ]);

  const title = plan?.title ?? "幹事ラボ";
  const subtitle = plan?.venue_name ?? "あらゆる集まりを、あなたが幹事する。";

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
