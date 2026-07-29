"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { formatDateOptionLabel } from "@/lib/surveys/format";
import type { AttendanceKind, OptionalAnswers, PublicSurvey, WillAttend } from "@/lib/surveys/types";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50";
const labelClass = "block text-sm font-medium text-ink";
const choiceButtonClass = (active: boolean) =>
  `rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium border transition-colors disabled:opacity-50 ${
    active ? "bg-gold-gradient border-transparent text-white" : "border-gold/15 text-ink-secondary hover:border-gold/30"
  }`;

const ATTEND_CHOICES: { value: AttendanceKind | "no"; label: string }[] = [
  { value: "full", label: "参加" },
  { value: "late", label: "遅刻するかも" },
  { value: "leave_early", label: "途中で抜けるかも" },
  { value: "no", label: "不参加" },
  { value: "undecided", label: "未定" },
];

export default function SurveyResponseForm({ survey }: { survey: PublicSurvey }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const [attendChoice, setAttendChoice] = useState<AttendanceKind | "no" | null>(null);
  const [arrivalTime, setArrivalTime] = useState("");
  const [leaveTime, setLeaveTime] = useState("");
  const [willConfirmLater, setWillConfirmLater] = useState(false);

  const [optionalAnswers, setOptionalAnswers] = useState<OptionalAnswers>({});
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDate(date: string) {
    setSelectedDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  }

  function setOptionalAnswer(id: string, value: string | string[] | undefined) {
    setOptionalAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMultiSelectAnswer(id: string, option: string) {
    const current = optionalAnswers[id];
    const arr = Array.isArray(current) ? current : [];
    setOptionalAnswer(id, arr.includes(option) ? arr.filter((v) => v !== option) : [...arr, option]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("お名前は必須です。");
      return;
    }
    setSubmitting(true);
    setError(null);

    let willAttend: WillAttend | null = null;
    let attendanceDetail: Record<string, unknown> | null = null;
    if (attendChoice === "full") {
      willAttend = "yes";
      attendanceDetail = { kind: "full" };
    } else if (attendChoice === "late") {
      willAttend = "yes";
      attendanceDetail = { kind: "late", arrival_time: arrivalTime || null };
    } else if (attendChoice === "leave_early") {
      willAttend = "yes";
      attendanceDetail = { kind: "leave_early", leave_time: leaveTime || null };
    } else if (attendChoice === "no") {
      willAttend = "no";
      attendanceDetail = null;
    } else if (attendChoice === "undecided") {
      willAttend = "maybe";
      attendanceDetail = { kind: "undecided", will_confirm_later: willConfirmLater };
    }

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
          attendance_detail: attendanceDetail,
          optional_answers: optionalAnswers,
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
            {survey.date_options.map((opt, i) => (
              <button
                key={`${opt.date}-${i}`}
                type="button"
                onClick={() => toggleDate(opt.date)}
                disabled={submitting}
                className={choiceButtonClass(selectedDates.includes(opt.date))}
              >
                {formatDateOptionLabel(opt)}
              </button>
            ))}
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
                className={choiceButtonClass(selectedBudget === budget)}
              >
                {budget}
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
                className={choiceButtonClass(selectedGenre === genre)}
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
          <div className="mt-1.5 flex flex-wrap gap-2">
            {ATTEND_CHOICES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAttendChoice(attendChoice === opt.value ? null : opt.value)}
                disabled={submitting}
                className={choiceButtonClass(attendChoice === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {attendChoice === "late" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="overflow-hidden"
              >
                <label className="block text-xs text-ink-muted mt-3 mb-1">到着予定時刻</label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  disabled={submitting}
                  className={inputClass.replace("mt-1.5 ", "")}
                />
              </motion.div>
            )}
            {attendChoice === "leave_early" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="overflow-hidden"
              >
                <label className="block text-xs text-ink-muted mt-3 mb-1">退出予定時刻</label>
                <input
                  type="time"
                  value={leaveTime}
                  onChange={(e) => setLeaveTime(e.target.value)}
                  disabled={submitting}
                  className={inputClass.replace("mt-1.5 ", "")}
                />
              </motion.div>
            )}
            {attendChoice === "undecided" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                className="overflow-hidden"
              >
                <label className="flex items-center gap-2 mt-3 text-sm text-ink-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={willConfirmLater}
                    onChange={(e) => setWillConfirmLater(e.target.checked)}
                    disabled={submitting}
                    className="h-5 w-5 accent-gold"
                  />
                  決まったら連絡します
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {survey.optional_questions.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-gold/10 pt-4">
          {survey.optional_questions.map((q) => (
            <div key={q.id}>
              <label className={labelClass}>{q.label}</label>
              {q.description && <p className="text-xs text-ink-muted mt-0.5">{q.description}</p>}

              {q.type === "text" && (
                <input
                  type="text"
                  value={(optionalAnswers[q.id] as string) ?? ""}
                  onChange={(e) => setOptionalAnswer(q.id, e.target.value)}
                  disabled={submitting}
                  className={inputClass}
                />
              )}

              {q.type === "yes_no" && (
                <div className="mt-1.5 flex gap-2">
                  {(["yes", "no"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setOptionalAnswer(q.id, optionalAnswers[q.id] === v ? undefined : v)}
                      disabled={submitting}
                      className={`flex-1 ${choiceButtonClass(optionalAnswers[q.id] === v)}`}
                    >
                      {v === "yes" ? "はい" : "いいえ"}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "select" && (
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {(q.options ?? []).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setOptionalAnswer(q.id, optionalAnswers[q.id] === option ? undefined : option)}
                      disabled={submitting}
                      className={choiceButtonClass(optionalAnswers[q.id] === option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {q.type === "multi_select" && (
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {(q.options ?? []).map((option) => {
                    const current = optionalAnswers[q.id];
                    const active = Array.isArray(current) && current.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleMultiSelectAnswer(q.id, option)}
                        disabled={submitting}
                        className={choiceButtonClass(active)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
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
