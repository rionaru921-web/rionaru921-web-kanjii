"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STATUS_MESSAGES = [
  "AIが候補店舗の中から最適な店を選定中...",
  "参加者の特徴を分析中...",
  "シチュエーションを理解中...",
  "候補店舗を絞り込み中...",
  "推薦理由を組み立て中...",
];

export default function AILoadingAnimation() {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-24 overflow-hidden">
      {/* faint warm particle field */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/30"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
            }}
            animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -10, 0] }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center gap-5 mb-10">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={`rounded-full bg-gold-gradient ${i === 1 ? "w-9 h-9" : "w-6 h-6 opacity-70"}`}
            animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <motion.p
        key={statusIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 font-serif text-sm text-ink-secondary text-center px-6"
      >
        {STATUS_MESSAGES[statusIndex]}
      </motion.p>
    </div>
  );
}
