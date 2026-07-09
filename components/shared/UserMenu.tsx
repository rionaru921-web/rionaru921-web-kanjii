"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ChevronDown } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface UserMenuProps {
  displayName: string;
}

export default function UserMenu({ displayName }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-gold/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-gradient text-sm font-semibold text-white">
          {initial}
        </div>
        <span className="hidden text-sm font-medium text-ink sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-ink-muted transition-transform sm:inline ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-gold/10 bg-surface-tertiary shadow-warm-hover"
          >
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-ink transition-colors hover:bg-gold/5"
            >
              <LayoutDashboard className="h-4 w-4 text-ink-muted" />
              ダッシュボード
            </Link>
            <div className="border-t border-gold/10" />
            <LogoutButton className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-vermilion transition-colors hover:bg-gold/5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
