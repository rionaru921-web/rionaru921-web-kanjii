"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, PlayCircle } from "lucide-react";
import GoldButton from "@/components/shared/GoldButton";
import ChochinIcon from "@/components/shared/ChochinIcon";
import UseCaseTags from "@/components/landing/UseCaseTags";
import GuestLoginButton from "@/components/auth/GuestLoginButton";

interface HeroProps {
  isLoggedIn: boolean;
}

export default function Hero({ isLoggedIn }: HeroProps) {
  return (
    <section className="relative overflow-hidden ink-wash px-4 sm:px-6 pt-14 pb-16">
      <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-surface-tertiary/70 px-4 py-1.5 text-xs text-gold tracking-wide">
            あらゆる集まりのための、幹事プラットフォーム
          </span>

          <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-6xl leading-[1.2] text-ink text-balance">
            あらゆる集まりを、
            <br />
            あなたが<span className="text-gold-gradient">幹事する</span>。
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink-secondary text-balance max-w-xl">
            URLを送るだけ。
            <br className="sm:hidden" />
            日程調整も、お店選びも、割り勘も。
          </p>

          <UseCaseTags />

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <GoldButton href={isLoggedIn ? "/dashboard" : "/signup"} size="lg">
              {isLoggedIn ? "マイページへ" : "無料ではじめる"}
            </GoldButton>
            <GoldButton href="#how-it-works" variant="outline" size="lg" icon={PlayCircle}>
              デモを見る
            </GoldButton>
          </div>

          {!isLoggedIn && (
            <div className="mt-4">
              <GuestLoginButton />
            </div>
          )}

          <div className="hidden lg:flex items-center gap-3 mt-16 text-ink-muted">
            <span className="h-px w-10 bg-ink-muted/40" />
            <span className="text-xs tracking-[0.2em] font-serif">EST. 2026</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative order-1 lg:order-2 flex justify-center lg:justify-end"
        >
          <div
            className="pointer-events-none absolute -inset-8 rounded-full opacity-60 blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(196,99,63,0.25), transparent 70%)",
            }}
          />
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[26rem] lg:h-[26rem] rounded-full overflow-hidden shadow-warm-hover border-4 border-white">
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80"
              alt="温かい飲食店の雰囲気"
              fill
              sizes="(max-width: 1024px) 320px, 416px"
              className="object-cover"
              style={{ filter: "sepia(0.05) saturate(1.1)" }}
              priority
            />
          </div>
          <ChochinIcon className="pointer-events-none absolute -bottom-4 -right-2 w-14 opacity-70 animate-chochin-sway hidden sm:block" />
        </motion.div>
      </div>

      <a
        href="#services"
        className="relative z-10 mt-4 lg:mt-0 flex flex-col items-center gap-1 text-ink-muted hover:text-gold transition-colors animate-bounce-slow mx-auto w-fit"
      >
        <span className="text-xs tracking-widest">4つのサービス</span>
        <ChevronDown size={18} />
      </a>
    </section>
  );
}
