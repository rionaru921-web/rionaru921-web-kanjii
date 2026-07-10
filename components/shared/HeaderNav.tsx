"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plus, X } from "lucide-react";
import Logo from "./Logo";
import GoldButton from "./GoldButton";
import UserMenu from "./UserMenu";
import CreatePlanButton from "./CreatePlanButton";
import { LogoutButton } from "@/components/auth/LogoutButton";

const NEW_PLAN_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient px-4 py-2 text-sm font-bold text-white shadow-gold transition-all duration-200 hover:brightness-110 hover:shadow-gold-lg";

const NAV_LINKS = [
  { href: "#services", label: "サービス" },
  { href: "#how-it-works", label: "使い方" },
  { href: "#pricing", label: "料金" },
  { href: "#faq", label: "FAQ" },
];

interface HeaderNavProps {
  isLoggedIn: boolean;
  displayName: string | null;
}

export default function HeaderNav({ isLoggedIn, displayName }: HeaderNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-gold/10 bg-[#F5F0E8]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink-secondary hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <CreatePlanButton className={NEW_PLAN_BUTTON_CLASSES}>
                <Plus className="h-4 w-4" />
                新しいプラン
              </CreatePlanButton>
              <UserMenu displayName={displayName ?? "ゲスト"} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-ink-secondary hover:text-gold transition-colors"
              >
                ログイン
              </Link>
              <GoldButton href="/signup" size="sm">
                無料ではじめる
              </GoldButton>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 text-ink"
          aria-label="メニュー"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gold/10 bg-[#F5F0E8] px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-ink-secondary hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}

          {isLoggedIn ? (
            <>
              <CreatePlanButton className={`${NEW_PLAN_BUTTON_CLASSES} w-full`}>
                <Plus className="h-4 w-4" />
                新しいプラン
              </CreatePlanButton>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="text-sm text-ink-secondary hover:text-gold transition-colors"
              >
                ダッシュボード
              </Link>
              <LogoutButton className="text-sm text-left text-vermilion hover:text-gold transition-colors" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-sm text-ink-secondary hover:text-gold transition-colors"
              >
                ログイン
              </Link>
              <GoldButton href="/signup" size="sm" fullWidth>
                無料ではじめる
              </GoldButton>
            </>
          )}
        </div>
      )}
    </header>
  );
}
