"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import GoldButton from "@/components/shared/GoldButton";
import { useGuestSignIn } from "@/lib/auth/useGuestSignIn";

interface EndingSceneProps {
  isLoggedIn: boolean;
  onRestart: () => void;
  onClose: () => void;
}

export default function EndingScene({ isLoggedIn, onRestart, onClose }: EndingSceneProps) {
  const router = useRouter();
  const { start, loading } = useGuestSignIn("/manual-plans/new");

  function handleTryNow() {
    if (isLoggedIn) {
      onClose();
      router.push("/manual-plans/new");
    } else {
      start();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center text-center max-w-md mx-auto"
    >
      <p className="text-gold text-lg mb-2" aria-hidden>
        ◇
      </p>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-surface-primary mb-4">
        体験ツアー、終了
      </h2>
      <p className="text-sm sm:text-base text-surface-primary/75 mb-8 leading-relaxed">
        幹事ラボは、あなたが幹事を
        <br />
        「楽しく」やるための道具です。
      </p>

      <div className="flex flex-col gap-3 w-full">
        <GoldButton onClick={handleTryNow} disabled={loading} size="lg" fullWidth>
          {loading ? "準備中..." : "今すぐ試す（ログイン不要）"}
        </GoldButton>
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-2 rounded-full border border-surface-primary/30 px-6 py-3 min-h-[44px] text-sm font-medium text-surface-primary transition-colors hover:border-surface-primary/60"
        >
          <RotateCcw size={14} />
          もう一度見る
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center gap-2 px-6 py-2 min-h-[44px] text-sm text-surface-primary/60 transition-colors hover:text-surface-primary"
        >
          <X size={14} />
          デモを終了する
        </button>
      </div>
    </motion.div>
  );
}
