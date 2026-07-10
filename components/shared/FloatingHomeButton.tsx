"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";

const HIDE_PATHS = ["/", "/dashboard", "/login", "/signup"];

export default function FloatingHomeButton() {
  const pathname = usePathname();

  const shouldHide = HIDE_PATHS.includes(pathname) || pathname.startsWith("/share/");

  if (shouldHide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link
          href="/dashboard"
          aria-label="ホームに戻る"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <Home className="h-6 w-6" />
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
