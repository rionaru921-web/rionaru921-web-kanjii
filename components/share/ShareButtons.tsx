import { MessageCircle, Mail } from "lucide-react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const lineHref = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
  const mailHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
    `${title}\n${url}`
  )}`;

  return (
    <div className="flex items-center justify-center gap-4">
      <a
        href={lineHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LINEで送る"
        className="flex flex-col items-center gap-1.5"
      >
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-warm border border-gold/15 shadow-warm hover:shadow-warm-hover hover:-translate-y-0.5 transition-all">
          <MessageCircle size={20} className="text-[#06C755]" />
        </span>
        <span className="text-[11px] text-ink-muted">LINE</span>
      </a>
      <a
        href={mailHref}
        aria-label="メールで送る"
        className="flex flex-col items-center gap-1.5"
      >
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-warm border border-gold/15 shadow-warm hover:shadow-warm-hover hover:-translate-y-0.5 transition-all">
          <Mail size={20} className="text-gold" />
        </span>
        <span className="text-[11px] text-ink-muted">メール</span>
      </a>
    </div>
  );
}
