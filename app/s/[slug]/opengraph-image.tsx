import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const alt = "幹事ラボ アンケート";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// app/share/plan/[token]/opengraph-image.tsx と同じ非サブセット Noto Sans JP
// woff(next/og のデフォルトフォントにはCJKグリフがないため必須)。
const NOTO_SANS_JP_URL =
  "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75g.woff";

export default async function SurveyOGImage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient();
  const [{ data: survey }, fontData] = await Promise.all([
    supabase.from("surveys").select("title, description").eq("slug", params.slug).maybeSingle(),
    fetch(NOTO_SANS_JP_URL).then((res) => res.arrayBuffer()),
  ]);

  const title = survey?.title ?? "幹事ラボ";
  const subtitle = survey?.description ?? "参加者アンケート";

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
        <div style={{ fontSize: 24, color: "#C4A56B", fontWeight: 700, marginTop: 24 }}>◇ 幹事アンケート ◇</div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#F7F3EA",
            marginTop: 20,
            maxWidth: 960,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 26, color: "#8B8378", marginTop: 20, maxWidth: 860, textAlign: "center" }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 22, color: "#C4A56B", marginTop: 36 }}>kanji-lab.com</div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: fontData, weight: 400, style: "normal" }],
    }
  );
}
