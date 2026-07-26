"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { formatDateOptionLabel } from "@/lib/surveys/format";
import type { PublicSurvey, WillAttend } from "@/lib/surveys/types";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50";
const labelClass = "block text-sm font-medium text-ink";

const ATTEND_OPTIONS: { value: WillAttend; label: string }[] = [
  { value: "yes", label: "参加" },
  { value: "no", label: "不参加" },
  { value: "maybe", label: "未定" },
];

export default function SurveyResponseForm({ survey }: { survey: PublicSurvey }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [willAttend, setWillAttend] = useState<WillAttend | null>(null);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDate(date: string) {
    setSelectedDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("お名前は必須です。");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/surveys/${survey.slug}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondent_name: name,
          respondent_email: email || null,
          selected_dates: selectedDates,
          selected_budget: selectedBudget,
          selected_genre: selectedGenre,
          will_attend: willAttend,
          free_comment: comment || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "回答の送信に失敗しました。");
      router.push(`/s/${survey.slug}/thanks`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "回答の送信に失敗しました。");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className={labelClass}>あなたのお名前 *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          className={inputClass}
          placeholder="山田太郎"
        />
      </div>

      <div>
        <label className={labelClass}>メールアドレス(任意)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      {survey.ask_dates && survey.date_options.length > 0 && (
        <div>
          <label className={labelClass}>日程どれが都合いい?(複数選択可)</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {survey.date_options.map((opt, i) => {
              const active = selectedDates.includes(opt.date);
              return (
                <button
                  key={`${opt.date}-${i}`}
                  type="button"
                  onClick={() => toggleDate(opt.date)}
                  disabled={submitting}
                  className={`rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium border transition-colors disabled:opacity-50 ${
                    active ? "bg-gold-gradient border-transparent text-white" : "border-gold/15 text-ink-secondary hover:border-gold/30"
                  }`}
                >
                  {formatDateOptionLabel(opt)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {survey.ask_budget && survey.budget_options.length > 0 && (
        <div>
          <label className={labelClass}>予算どれくらい?</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {survey.budget_options.map((budget) => (
              <button
                key={budget}
                type="button"
                onClick={() => setSelectedBudget(selectedBudget === budget ? null : budget)}
                disabled={submitting}
                className={`rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium border transition-colors disabled:opacity-50 ${
                  selectedBudget === budget
                    ? "bg-gold-gradient border-transparent text-white"
                    : "border-gold/15 text-ink-secondary hover:border-gold/30"
                }`}
              >
                {budget}円
              </button>
            ))}
          </div>
        </div>
      )}

      {survey.ask_genre && survey.genre_options.length > 0 && (
        <div>
          <label className={labelClass}>ジャンル希望は?</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {survey.genre_options.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                disabled={submitting}
                className={`rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium border transition-colors disabled:opacity-50 ${
                  selectedGenre === genre
                    ? "bg-gold-gradient border-transparent text-white"
                    : "border-gold/15 text-ink-secondary hover:border-gold/30"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {survey.ask_attend && (
        <div>
          <label className={labelClass}>参加できる?</label>
          <div className="mt-1.5 flex gap-2">
            {ATTEND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWillAttend(willAttend === opt.value ? null : opt.value)}
                disabled={submitting}
                className={`flex-1 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium border transition-colors disabled:opacity-50 ${
                  willAttend === opt.value
                    ? "bg-gold-gradient border-transparent text-white"
                    : "border-gold/15 text-ink-secondary hover:border-gold/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>コメント(任意)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitting}
          className={`${inputClass} min-h-[80px] resize-none`}
          placeholder="幹事さんへのメッセージなど"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion-text">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3 text-sm hover:brightness-110 transition-all shadow-gold disabled:opacity-50"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {submitting ? "送信中..." : "回答する"}
      </button>
    </form>
  );
}
