"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, GraduationCap, Sparkles } from "lucide-react";
import { getQuestion, TOTAL_STEPS } from "@/lib/coaching/questions";
import { CoachResult } from "./CoachResult";
import type { PlanType } from "@/lib/coaching/planContext";

type Session = {
  id: string;
  qa_pairs: Array<{ step: number; answer: string }>;
  current_step: number;
  status: "in_progress" | "completed" | "abandoned";
  ai_summary?: string | null;
  ai_strengths?: string[] | null;
  ai_improvements?: string[] | null;
};

type Props = {
  planType: PlanType;
  planId: string;
  open: boolean;
  onClose: () => void;
};

export function CoachDialog({ planType, planId, open, onClose }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [answer, setAnswer] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmClose(false);
    setAnswer("");
    setCustomInput("");
    setShowCustom(false);
    setError(null);
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, planType, planId]);

  async function initSession() {
    setLoading(true);
    setError(null);
    try {
      const getRes = await fetch(`/api/coaching/session?plan_type=${planType}&plan_id=${planId}`);
      const getJson = await getRes.json();
      if (!getRes.ok) throw new Error(getJson.error || "セッション取得に失敗しました");

      if (getJson.session) {
        setSession(getJson.session);
        if (getJson.session.status === "completed") {
          setCurrentStep(TOTAL_STEPS + 1);
        } else {
          setCurrentStep(Math.max(1, getJson.session.current_step || 1));
        }
      } else {
        const postRes = await fetch("/api/coaching/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan_type: planType, plan_id: planId }),
        });
        const postJson = await postRes.json();
        if (!postRes.ok) throw new Error(postJson.error || "セッション作成に失敗しました");
        setSession(postJson.session);
        setCurrentStep(1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!session) return;
    const finalAnswer = showCustom ? customInput.trim() : answer.trim();
    const question = getQuestion(currentStep);
    if (!question) return;

    if (!question.optional && !finalAnswer) {
      setError("回答を入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coaching/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id, step: currentStep, answer: finalAnswer }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "回答の保存に失敗しました");

      setSession(json.session);
      setAnswer("");
      setCustomInput("");
      setShowCustom(false);

      if (json.is_completed) {
        await generateFeedback(session.id);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function generateFeedback(sessionId: string) {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/coaching/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "AI_LIMIT_REACHED") {
          throw new Error("今月のAI使用回数の上限に達しました。来月までお待ちください。");
        }
        throw new Error(json.error || "フィードバックの生成に失敗しました");
      }
      setSession(json.session);
      setCurrentStep(TOTAL_STEPS + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  }

  function handleBack() {
    if (currentStep <= 1) return;
    setCurrentStep(currentStep - 1);
    setAnswer("");
    setCustomInput("");
    setShowCustom(false);
    setError(null);
  }

  const isMidSession =
    !!session && session.status === "in_progress" && !loading && !generating && currentStep <= TOTAL_STEPS;

  function handleCloseRequest() {
    if (isMidSession) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  }

  if (!open) return null;

  const question = getQuestion(currentStep);
  const isResult = currentStep > TOTAL_STEPS && session?.status === "completed";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
        onClick={handleCloseRequest}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-lg bg-surface-tertiary shadow-warm-hover rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={handleCloseRequest}
            aria-label="閉じる"
            className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="flex items-center gap-2 font-serif font-bold text-lg text-ink pr-8">
            <GraduationCap className="text-gold" size={20} />
            AI幹事コーチ
          </h2>

          <div className="mt-5">
            {confirmClose ? (
              <div className="space-y-4 py-4">
                <p className="text-sm text-ink text-center leading-relaxed">
                  ここまでの回答は保存されています。
                  <br />
                  閉じてもあとで続きから再開できます。
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmClose(false)}
                    className="flex-1 rounded-xl border border-gold/15 bg-surface-tertiary py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/5"
                  >
                    続ける
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
                  >
                    保存して閉じる
                  </button>
                </div>
              </div>
            ) : generating ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Sparkles className="text-gold animate-pulse" size={28} />
                <p className="text-sm text-ink-secondary text-center">
                  AIがフィードバックを生成中...
                  <br />
                  数秒お待ちください
                </p>
              </div>
            ) : loading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={28} className="text-gold animate-spin" />
              </div>
            ) : isResult && session ? (
              <CoachResult session={session} onClose={onClose} />
            ) : question ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-ink-muted">
                    <span>
                      ステップ {currentStep} / {TOTAL_STEPS}
                    </span>
                    <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gold/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-base font-medium text-ink leading-relaxed">{question.question}</p>
                  {question.optional && (
                    <p className="text-xs text-ink-muted mt-1">※ この質問はスキップできます</p>
                  )}
                </div>

                {question.type === "choice" && !showCustom && (
                  <div className="flex flex-col gap-2">
                    {question.choices?.map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => {
                          if (choice === "その他") {
                            setShowCustom(true);
                            setAnswer("");
                          } else {
                            setAnswer(choice);
                          }
                        }}
                        className={`px-4 py-3 rounded-xl border text-left text-sm transition-colors ${
                          answer === choice
                            ? "border-gold bg-gold/10 text-ink"
                            : "border-gold/15 text-ink-secondary hover:border-gold/40 hover:text-gold"
                        }`}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "choice" && showCustom && (
                  <div className="space-y-2">
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="自由記述..."
                      autoFocus
                      className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold min-h-[80px] resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustom(false);
                        setCustomInput("");
                      }}
                      className="text-xs text-ink-muted hover:text-ink transition-colors"
                    >
                      ← 選択肢に戻る
                    </button>
                  </div>
                )}

                {question.type === "scale" && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: (question.scaleMax ?? 5) - (question.scaleMin ?? 1) + 1 }).map(
                      (_, i) => {
                        const val = (question.scaleMin ?? 1) + i;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAnswer(String(val))}
                            className={`w-12 h-12 rounded-xl border text-lg font-bold transition-colors ${
                              answer === String(val)
                                ? "border-gold bg-gold/15 text-gold"
                                : "border-gold/15 text-ink-secondary hover:border-gold/40"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

                {question.type === "text" && (
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={question.optional ? "任意で入力..." : "回答を入力..."}
                    className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold min-h-[100px] resize-none"
                  />
                )}

                {error && (
                  <div className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 rounded-xl border border-gold/15 bg-surface-tertiary py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/5"
                    >
                      ← 戻る
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={loading || (!question.optional && !answer && !customInput)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {currentStep === TOTAL_STEPS
                      ? "フィードバックを見る"
                      : question.optional && !answer && !customInput
                        ? "スキップ"
                        : "次へ"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
