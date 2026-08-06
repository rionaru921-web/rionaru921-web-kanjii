import { ImageResponse } from "next/og";

export const runtime = "edge";

// Android の maskable icon: OS側で円/角丸四角などにマスクされるため、
// 背景は512フチいっぱいに敷き(透過・角丸なし)、提灯本体は中央の
// 「安全円」(直径80%目安)に収まるよう icon-512 よりひと回り小さく描画する。
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #F5F0E8 0%, #EDE4D3 100%)",
        }}
      >
        <svg width="230" height="307" viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chochin-maskable" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E89272" />
              <stop offset="55%" stopColor="#C4633F" />
              <stop offset="100%" stopColor="#A85030" />
            </linearGradient>
          </defs>
          <line x1="60" y1="4" x2="60" y2="22" stroke="#C4633F" strokeWidth="2" />
          <rect x="44" y="18" width="32" height="14" rx="4" fill="#C4633F" />
          <ellipse cx="60" cy="88" rx="50" ry="60" fill="url(#chochin-maskable)" />
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
    { width: 512, height: 512 }
  );
}
