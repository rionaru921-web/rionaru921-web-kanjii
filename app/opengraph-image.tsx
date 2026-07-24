import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "幹事ラボ - あらゆる集まりを、あなたが幹事する。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// next/og's default font has no CJK glyphs, so Japanese text renders as
// blank boxes unless a full-glyph font is supplied explicitly. Reuses the
// same consolidated (non-subsetted) Noto Sans JP woff already verified
// working for PDF generation in lib/pdf/styles.ts.
const NOTO_SANS_JP_URL =
  "https://fonts.gstatic.com/s/notosansjp/v56/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75g.woff";

export default async function OGImage() {
  const fontData = await fetch(NOTO_SANS_JP_URL).then((res) => res.arrayBuffer());

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
          background: "linear-gradient(135deg, #F5F0E8 0%, #EDE4D3 100%)",
          fontFamily: "Noto Sans JP",
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 700,
            color: "#C4633F",
            letterSpacing: "-0.02em",
            fontFamily: "serif",
          }}
        >
          幹事ラボ
        </div>
        <div
          style={{
            fontSize: 40,
            color: "#2B2420",
            marginTop: 20,
          }}
        >
          あらゆる集まりを、あなたが幹事する。
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#6B5D52",
            marginTop: 40,
          }}
        >
          飲み会 · 旅行 · イベント
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            color: "#A89B8E",
          }}
        >
          kanji-lab.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: fontData, weight: 400, style: "normal" }],
    }
  );
}
