import { ImageResponse } from "next/og";

export const runtime = "edge";

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
          background: "radial-gradient(circle, #2A2420 0%, #1F1B18 100%)",
        }}
      >
        <svg
          width="290"
          height="387"
          viewBox="0 0 120 160"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="chochin-glow" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#D4A94D" />
              <stop offset="55%" stopColor="#B85450" />
              <stop offset="100%" stopColor="#9F4642" />
            </radialGradient>
          </defs>
          <line x1="60" y1="4" x2="60" y2="22" stroke="#C4A56B" strokeWidth="2" />
          <rect x="44" y="18" width="32" height="14" rx="4" fill="#C4A56B" />
          <ellipse cx="60" cy="88" rx="50" ry="60" fill="url(#chochin-glow)" />
          {[42, 58, 74, 90, 106, 122, 134].map((y) => (
            <path
              key={y}
              d={`M 14 ${y} Q 60 ${y} 106 ${y}`}
              stroke="#9F4642"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
          <rect x="44" y="126" width="32" height="14" rx="4" fill="#C4A56B" />
          <line x1="60" y1="138" x2="60" y2="156" stroke="#C4A56B" strokeWidth="2" />
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
