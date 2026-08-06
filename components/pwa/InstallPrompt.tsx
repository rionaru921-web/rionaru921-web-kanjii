"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ChochinIcon from "@/components/shared/ChochinIcon";
import GoldButton from "@/components/shared/GoldButton";

const DISMISS_KEY = "pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

// Android Chrome 等、beforeinstallprompt に対応するブラウザでのみ表示する
// (iOS Safariはこのイベント自体を発火しないため、自動的に非表示のまま —
// 「共有→ホーム画面に追加」の手動導線のみになる。専用の説明UIはWave 27の
// スコープ外)。FloatingBottomNav(中央寄せの丸ピル型ナビ、bottom 1.5rem
// 付近)と縦位置が被らないよう、それより上に配置する。
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }

  return (
    <div className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-30 mx-auto max-w-md rounded-2xl border border-gold/20 bg-surface-tertiary/95 p-4 shadow-gold-lg backdrop-blur-md">
      <div className="flex items-start gap-3">
        <ChochinIcon className="w-10 h-14 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-ink mb-1">アプリとして使う</h3>
          <p className="text-sm text-ink-secondary mb-3">ホーム画面に追加して、いつでもすぐアクセス</p>
          <div className="flex gap-2">
            <GoldButton onClick={handleInstall} size="sm">
              追加する
            </GoldButton>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-ink-secondary hover:text-ink transition-colors"
            >
              後で
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="閉じる"
          className="shrink-0 text-ink-muted hover:text-ink transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
