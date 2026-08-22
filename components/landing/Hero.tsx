"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown, PlayCircle, Zap } from "lucide-react";
import GoldButton from "@/components/shared/GoldButton";
import ChochinIcon from "@/components/shared/ChochinIcon";
import UseCaseTags from "@/components/landing/UseCaseTags";
import HeroMockup from "@/components/landing/HeroMockup";
import HeroCTA from "@/components/landing/HeroCTA";
import AppStoreBadge from "@/components/landing/AppStoreBadge";
import { useGuestSignIn } from "@/lib/auth/useGuestSignIn";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const DemoModal = dynamic(() => import("@/components/landing/demo/DemoModal"), { ssr: false });

interface HeroProps {
  isLoggedIn: boolean;
}

export default function Hero({ isLoggedIn }: HeroProps) {
  const { start, loading, error } = useGuestSignIn("/manual-plans/new");
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden ink-wash px-4 sm:px-6 pt-20 pb-20">
      <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          <motion.span
            variants={fadeInUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold bg-gradient-to-r from-gold/10 to-gold/5 px-4 py-1.5 text-sm font-semibold text-gold tracking-wide"
          >
            <Zap size={14} aria-hidden />
            すぐ使える · 登録不要 · ブラウザだけでOK
          </motion.span>

          <h1 className="font-serif leading-[1.2] text-balance">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="block font-black text-4xl sm:text-6xl lg:text-6xl text-gold-gradient"
            >
              ログイン不要。
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="block font-bold text-2xl sm:text-4xl lg:text-4xl text-ink mt-2"
            >
              今すぐ、幹事プランを作る。
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 text-base sm:text-lg text-ink-secondary text-balance max-w-xl"
          >
            あらゆる集まりを、あなたが幹事する。
            <br className="sm:hidden" />
            URLを送るだけ。日程調整も、お店選びも、割り勘も。
          </motion.p>

          <motion.div variants={fadeInUp}>
            <UseCaseTags />
          </motion.div>

          {isLoggedIn ? (
            <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <GoldButton href="/dashboard" size="lg">
                マイページへ
              </GoldButton>
              <GoldButton onClick={() => setDemoOpen(true)} variant="outline" size="lg" icon={PlayCircle}>
                デモを見る
              </GoldButton>
            </motion.div>
          ) : (
            <motion.div variants={fadeInUp} className="mt-10 flex flex-col items-center lg:items-start gap-3 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <HeroCTA onClick={start} loading={loading} />
                <Link
                  href="/signup"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-gold/40 text-ink hover:border-gold hover:bg-gold/5 transition-all duration-200 text-sm py-3 px-6"
                >
                  アカウントを作って保存する
                </Link>
              </div>
              {error && <p className="text-xs text-vermilion-text">{error}</p>}
              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="mt-1 text-sm text-ink-secondary hover:text-gold transition-colors underline underline-offset-4"
              >
                デモを見る
              </button>
              <div className="mt-2 flex flex-col items-center lg:items-start gap-1.5">
                <span className="text-xs text-ink-muted">iOSアプリも配信中</span>
                <AppStoreBadge />
              </div>
            </motion.div>
          )}

          <div className="hidden lg:flex items-center gap-3 mt-16 text-ink-muted">
            <span className="h-px w-10 bg-ink-muted/40" />
            <span className="text-xs tracking-[0.2em] font-serif">EST. 2026</span>
          </div>
        </motion.div>

        <div className="relative flex justify-center lg:justify-end">
          <ChochinIcon className="pointer-events-none absolute -bottom-8 -right-6 w-14 opacity-70 animate-chochin-sway hidden sm:block" />
          <HeroMockup />
        </div>
      </div>

      <a
        href="#services"
        className="relative z-10 mt-4 lg:mt-0 flex flex-col items-center gap-1 text-ink-muted hover:text-gold transition-colors animate-bounce-slow mx-auto w-fit"
      >
        <span className="text-xs tracking-widest">4つのサービス</span>
        <ChevronDown size={18} />
      </a>

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} isLoggedIn={isLoggedIn} />}
    </section>
  );
}
