import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F5F0E8 0%, #EDE4D3 100%)",
        }}
      >
        <div
          style={{
            fontFamily: "serif",
            fontSize: 108,
            fontWeight: 700,
            color: "#C4633F",
          }}
        >
          K
        </div>
      </div>
    ),
    { ...size }
  );
}
