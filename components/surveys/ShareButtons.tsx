"use client";

import { Share2, MessageCircle, Mail } from "lucide-react";

const buttonClass =
  "flex flex-col items-center justify-center gap-1 rounded-xl border border-gold/20 py-2.5 text-[11px] font-medium text-gold hover:bg-gold/5 transition-colors";

// 回答完了ページから、まだ答えていない参加者にアンケートURLを再シェアして
// もらうための導線。回答"内容"ではなく、アンケートそのものの共有URL。
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const text = `「${title}」のアンケートに回答しました。あなたもどうぞ!`;

  function openShareWindow(shareUrl: string) {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        onClick={() =>
          openShareWindow(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
          )
        }
        className={buttonClass}
      >
        <Share2 size={16} />
        X
      </button>
      <button
        type="button"
        onClick={() => openShareWindow(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`)}
        className={buttonClass}
      >
        <MessageCircle size={16} />
        LINE
      </button>
      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n${url}`)}`}
        className={buttonClass}
      >
        <Mail size={16} />
        メール
      </a>
    </div>
  );
}
