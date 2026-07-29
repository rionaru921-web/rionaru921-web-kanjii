"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ChochinIcon from "@/components/shared/ChochinIcon";

// Page wrapper for the participant-facing share screens ("割烹の暖簾" theme).
// Deliberately independent from the operator dashboard's shared Logo/GoldButton —
// see the share-screen redesign scope notes for why those aren't reused here.
export function WashokuShell({
  eyebrow = "幹事さんから招待されました",
  // Opt-in only — omitted entirely by app/share/[token]/page.tsx (the
  // history-sharing flow), which must keep animating on every visit exactly
  // as before. Only app/share/plan/[token]/page.tsx passes this, gating the
  // lantern intro to a visitor's first view per share link this session.
  sessionKey,
  children,
}: {
  eyebrow?: string;
  sessionKey?: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const alreadySeen =
    (!!sessionKey &&
      typeof window !== "undefined" &&
      sessionStorage.getItem(`kanjii_chochin_seen_${sessionKey}`) === "1") ||
    !!reduceMotion;

  if (sessionKey && typeof window !== "undefined" && !alreadySeen) {
    sessionStorage.setItem(`kanjii_chochin_seen_${sessionKey}`, "1");
  }

  return (
    <div className="washoku px-4 py-10 flex flex-col items-center">
      <motion.div
        initial={alreadySeen ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: alreadySeen ? 0 : 1.1, ease: "easeOut" }}
        className="relative flex items-center justify-center"
      >
        <div className="absolute inset-0 washoku-glow blur-xl scale-150 -z-10" />
        <ChochinIcon className="w-14 h-14 sm:w-16 sm:h-16" />
      </motion.div>

      <p className="mt-4 font-serif text-sm text-washoku-paper-muted">{eyebrow}</p>

      <div className="w-full max-w-lg mt-6 flex flex-col gap-6">{children}</div>

      <Link
        href="/"
        className="mt-10 font-serif text-xs text-washoku-brass hover:text-washoku-paper transition-colors"
      >
        〜 幹事ラボにて謹製 〜
      </Link>
    </div>
  );
}
