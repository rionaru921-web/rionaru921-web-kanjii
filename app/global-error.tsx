"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          backgroundColor: "#F5F0E8",
          color: "#2B2420",
          fontFamily: "sans-serif",
        }}
      >
        <p style={{ fontSize: "56px", margin: "0 0 16px" }}>🏮</p>
        <p style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
          一時的な不具合が発生しました
        </p>
        <p style={{ fontSize: "14px", color: "#6B5D52", maxWidth: "360px", margin: "0 0 32px" }}>
          お手数ですが、再読み込みをお試しください。問題が続く場合はお問い合わせください: steplife.contact@gmail.com
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: "none",
            borderRadius: "9999px",
            padding: "14px 32px",
            fontSize: "15px",
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(135deg, #E89272, #C4633F, #A85030)",
            cursor: "pointer",
          }}
        >
          再読み込み
        </button>
      </body>
    </html>
  );
}
