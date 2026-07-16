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
        <svg
          width="108"
          height="144"
          viewBox="0 0 120 160"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="chochin-fav-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E89272" />
              <stop offset="55%" stopColor="#C4633F" />
              <stop offset="100%" stopColor="#A85030" />
            </linearGradient>
          </defs>
          <line x1="60" y1="4" x2="60" y2="22" stroke="#C4633F" strokeWidth="2" />
          <rect x="44" y="18" width="32" height="14" rx="4" fill="#C4633F" />
          <ellipse cx="60" cy="88" rx="50" ry="60" fill="url(#chochin-fav-body)" />
          {[42, 58, 74, 90, 106, 122, 134].map((y) => (
            <path
              key={y}
              d={`M 14 ${y} Q 60 ${y} 106 ${y}`}
              stroke="#A85030"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
          <rect x="44" y="126" width="32" height="14" rx="4" fill="#C4633F" />
          <line x1="60" y1="138" x2="60" y2="156" stroke="#C4633F" strokeWidth="2" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
