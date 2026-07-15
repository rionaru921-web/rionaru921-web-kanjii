"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import LegalContent from "@/components/legal/LegalContent";

const SUBJECT_OPTIONS = ["バグ報告", "機能要望", "削除依頼", "一般", "その他"];
const CONTACT_EMAIL = "steplife.contact@gmail.com";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[3]);
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `お名前: ${name}\nメールアドレス: ${email}\n件名: ${subject}\n\n${message}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `[幹事ラボ お問い合わせ] ${subject}`
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <LegalContent title="お問い合わせ" lastUpdated="2026年3月">
      <p className="mb-8">
        幹事ラボに関するご質問・ご要望・不具合報告は、以下のフォームよりお送りください。送信ボタンを押すとお使いのメールソフトが起動し、内容が入力された状態でメールを作成できます。
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="block text-xs text-ink-secondary mb-1.5">お名前</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 成瀬璃雄"
            className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
          />
        </div>

        <div>
          <label className="block text-xs text-ink-secondary mb-1.5">メールアドレス</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="例: you@example.com"
            className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
          />
        </div>

        <div>
          <label className="block text-xs text-ink-secondary mb-1.5">件名</label>
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSubject(opt)}
                className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
                  subject === opt
                    ? "bg-gold-gradient border-transparent text-white"
                    : "border-gold/15 text-ink-secondary hover:border-gold/40 hover:text-gold"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-ink-secondary mb-1.5">本文</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="お問い合わせ内容をご記入ください"
            rows={6}
            className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted resize-none"
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3.5 text-base hover:brightness-110 transition-all shadow-gold"
        >
          <Send size={16} />
          送信する
        </button>

        <p className="text-xs text-ink-muted leading-relaxed">
          ※ 送信にはお使いのメールソフトが起動します。返信までに数日いただくことがございます。あらかじめご了承ください。
        </p>
      </form>
    </LegalContent>
  );
}
