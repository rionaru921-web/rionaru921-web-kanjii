"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import GoldButton from "./GoldButton";

const NAV_LINKS = [
  { href: "#services", label: "サービス" },
  { href: "#how-it-works", label: "使い方" },
  { href: "#pricing", label: "料金" },
  { href: "#faq", label: "FAQ" },
];

export default function Header() {
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

        <div className="hidden md:block">
          <GoldButton href="/signup" size="sm">
            無料ではじめる
          </GoldButton>
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
          <GoldButton href="/signup" size="sm" fullWidth>
            無料ではじめる
          </GoldButton>
        </div>
      )}
    </header>
  );
}
