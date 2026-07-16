import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F0E8",
          borderRadius: 7,
        }}
      >
        <svg
          width="20"
          height="26"
          viewBox="0 0 120 160"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="46" y="18" width="28" height="13" rx="3.5" fill="#C4633F" />
          <ellipse cx="60" cy="88" rx="49" ry="60" fill="#C4633F" />
          <rect x="46" y="129" width="28" height="13" rx="3.5" fill="#C4633F" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
