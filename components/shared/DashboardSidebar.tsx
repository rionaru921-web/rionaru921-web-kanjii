"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Wine,
  Sparkles,
  Plane,
  PartyPopper,
  Briefcase,
  History,
  Settings,
  User,
  Menu,
  X,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import Logo from "./Logo";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AdSlot } from "@/components/ads/AdSlot";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import { useToasts, ToastStack } from "@/components/ui/RealtimeToast";

const MAIN_NAV = [
  { href: "/dashboard", label: "ホーム", icon: Home },
  { href: "/nomikai", label: "飲み会", icon: Wine },
  { href: "/nomikai/suggest", label: "AI提案（補助）", icon: Sparkles },
  { href: "/travel", label: "旅行", icon: Plane },
  { href: "/event", label: "イベント", icon: PartyPopper, disabled: true },
  { href: "/company", label: "会社", icon: Briefcase, disabled: true },
];

const BOTTOM_NAV = [
  { href: "/history", label: "履歴", icon: History },
  { href: "/settings/growth", label: "成長記録", icon: GraduationCap },
  { href: "/settings/payment", label: "集金設定", icon: Settings },
  { href: "/settings/profile", label: "プロフィール", icon: User },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {MAIN_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        if (item.disabled) {
          return (
            <div
              key={item.href}
              className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-sm text-ink-muted cursor-not-allowed border-l-4 border-transparent"
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {item.label}
              </span>
              <span className="text-[10px] rounded-full bg-ink-muted/15 text-ink-muted px-2 py-0.5">
                Soon
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors border-l-4 ${
              active
                ? "bg-gold/10 text-gold border-gold"
                : "text-ink-secondary hover:bg-gold/5 hover:text-ink border-transparent"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomLinks({
  pathname,
  onNavigate,
  onOpenFeedback,
}: {
  pathname: string;
  onNavigate?: () => void;
  onOpenFeedback: () => void;
}) {
  return (
    <div className="flex flex-col gap-1 pt-4 border-t border-gold/10">
      {BOTTOM_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors border-l-4 ${
              active
                ? "bg-gold/10 text-gold border-gold"
                : "text-ink-secondary hover:bg-gold/5 hover:text-ink border-transparent"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          onOpenFeedback();
        }}
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-ink-secondary hover:bg-gold/5 hover:text-ink transition-colors border-l-4 border-transparent w-full text-left"
      >
        <MessageSquare size={18} />
        フィードバック
      </button>
      <LogoutButton
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-ink-secondary hover:bg-vermilion/5 hover:text-vermilion-text transition-colors w-full text-left"
      />
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { toasts, pushToast } = useToasts();

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-gold/10 bg-surface-tertiary/90 backdrop-blur-md px-4 py-3.5">
        <Logo size="sm" href="/dashboard" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 text-ink"
          aria-label="メニューを開く"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-surface-tertiary border-r border-gold/10 px-4 py-4 flex flex-col shadow-warm-hover">
            <div className="flex items-center justify-between mb-6">
              <Logo size="sm" href="/dashboard" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-ink"
                aria-label="メニューを閉じる"
              >
                <X size={20} />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <BottomLinks
                pathname={pathname}
                onNavigate={() => setOpen(false)}
                onOpenFeedback={() => setFeedbackOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-60 border-r border-gold/10 bg-surface-tertiary px-4 py-5">
        <div className="mb-8 px-1">
          <Logo size="sm" href="/dashboard" />
        </div>
        <NavLinks pathname={pathname} />
        <div className="mt-auto">
          <BottomLinks pathname={pathname} onOpenFeedback={() => setFeedbackOpen(true)} />
          <AdSlot slot="sidebar" className="mt-4" />
        </div>
      </aside>

      {feedbackOpen && (
        <FeedbackModal
          onClose={() => setFeedbackOpen(false)}
          onSuccess={() => {
            setFeedbackOpen(false);
            pushToast("フィードバックありがとうございます！");
          }}
        />
      )}
      <ToastStack toasts={toasts} />
    </>
  );
}
