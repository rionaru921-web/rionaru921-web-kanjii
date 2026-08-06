import { ImageResponse } from "next/og";

export const runtime = "edge";

// app/apple-icon.tsx と同じ提灯モチーフ・同じ縦横比(180枠に108x144)を
// PWA manifest 用の192サイズへ拡大しただけ。デザインの一貫性を優先し、
// Wave 21 の app/x-icon(ダーク背景のOG画像用)とは別系統として新規作成。
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F5F0E8 0%, #EDE4D3 100%)",
        }}
      >
        <svg width="115" height="154" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chochin-192" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E89272" />
              <stop offset="55%" stopColor="#C4633F" />
              <stop offset="100%" stopColor="#A85030" />
            </linearGradient>
          </defs>
          <line x1="60" y1="4" x2="60" y2="22" stroke="#C4633F" strokeWidth="2" />
          <rect x="44" y="18" width="32" height="14" rx="4" fill="#C4633F" />
          <ellipse cx="60" cy="88" rx="50" ry="60" fill="url(#chochin-192)" />
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
    { width: 192, height: 192 }
  );
}
