"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ClipboardList } from "lucide-react";
import ChapterHeading from "@/components/manual-plans/sections/ChapterHeading";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import OptionListInput from "./OptionListInput";
import DateOptionInput from "./DateOptionInput";
import OptionalQuestionsSection from "./OptionalQuestionsSection";
import SurveyPreview from "./SurveyPreview";
import { sanitizeNumericInput } from "@/lib/format/currency";
import { BUDGET_SLIDER_PRESETS, EVENT_PRESETS, PRESET_LABELS } from "@/lib/surveys/presets";
import type { DateOption, OptionalQuestion, SurveyEventType } from "@/lib/surveys/types";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50";
const labelClass = "block text-sm font-medium text-ink";

const EVENT_TYPE_OPTIONS: { value: SurveyEventType; label: string }[] = [
  { value: "nomikai", label: "飲み会" },
  { value: "travel", label: "旅行" },
  { value: "kangeikai", label: "歓迎会" },
  { value: "sobetsukai", label: "送別会" },
  { value: "birthday", label: "誕生日" },
  { value: "other", label: "その他" },
];

export default function SurveyForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<SurveyEventType | null>(null);

  const [askDates, setAskDates] = useState(true);
  const [askBudget, setAskBudget] = useState(true);
  const [askGenre, setAskGenre] = useState(true);
  const [askAttend, setAskAttend] = useState(true);

  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [budgetMinInput, setBudgetMinInput] = useState("1000");
  const [budgetMaxInput, setBudgetMaxInput] = useState("10000");
  const [budgetStepInput, setBudgetStepInput] = useState("500");
  const budgetMin = Number(budgetMinInput) || 0;
  const budgetMax = Number(budgetMaxInput) || 0;
  const budgetStep = Number(budgetStepInput) || 0;
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [optionalQuestions, setOptionalQuestions] = useState<OptionalQuestion[]>([]);
  const [deadline, setDeadline] = useState("");

  const [presetDialogFor, setPresetDialogFor] = useState<SurveyEventType | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 「使いたい人だけ」原則: イベント種類を選んだ直後にテンプレ適用の
  // 確認を出すが、「自分でカスタム」でスキップすれば従来通りの空欄のまま。
  function handleEventTypeClick(value: SurveyEventType) {
    if (eventType === value) {
      setEventType(null);
      return;
    }
    setEventType(value);
    if (value !== "other") {
      setPresetDialogFor(value);
    }
  }

  function applyPreset(type: SurveyEventType) {
    const preset = EVENT_PRESETS[type];
    const budgetPreset = BUDGET_SLIDER_PRESETS[type];
    setGenreOptions(preset.genreOptions);
    setBudgetMinInput(String(budgetPreset.min));
    setBudgetMaxInput(String(budgetPreset.max));
    setBudgetStepInput(String(budgetPreset.step));
    setAskBudget(true);
    setAskGenre(true);
    setPresetDialogFor(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルは必須です。");
      return;
    }
    if (askDates && dateOptions.length === 0) {
      setError("日程候補を1つ以上追加してください(入力後に「＋」を押す必要があります)。");
      return;
    }
    if (askBudget && budgetMin >= budgetMax) {
      setError("予算の最大値は最小値より大きくしてください。");
      return;
    }
    if (askGenre && genreOptions.length === 0) {
      setError("ジャンル候補を1つ以上追加してください(入力後に「＋」を押す必要があります)。");
      return;
    }
    setSaving(true);
    setError(null);

    // Wave 28: 基本ジャンル・基本予算は専用カラム(ask_genre/genre_options,
    // ask_budget/budget_options)をやめ、optional_questions の
    // select / budget_slider として送る。第四・五章の入力UI自体は維持しつつ、
    // 送信時にだけ変換することで、参加者側の回答UI・集計・結果表示は
    // 既存の汎用ロジック(optional_questions ベース)をそのまま使い回せる。
    const questionsToSend: OptionalQuestion[] = [];
    if (askGenre && genreOptions.length > 0) {
      questionsToSend.push({ id: "genre", label: "ジャンル希望は?", type: "select", options: genreOptions });
    }
    if (askBudget && budgetMin < budgetMax) {
      questionsToSend.push({
        id: "budget",
        label: "予算どれくらい?",
        type: "budget_slider",
        sliderMin: budgetMin,
        sliderMax: budgetMax,
        sliderStep: budgetStep,
      });
    }
    questionsToSend.push(...optionalQuestions);

    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          eventType,
          askDates,
          askBudget: false,
          askGenre: false,
          askAttend,
          dateOptions,
          budgetOptions: [],
          genreOptions: [],
          optionalQuestions: questionsToSend,
          deadline: deadline || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "作成に失敗しました。");
      router.push(`/surveys/${data.survey.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました。");
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 items-start">
      <form onSubmit={handleSubmit} className="flex flex-col gap-16">
      <div>
        <ChapterHeading number="第一章" title="アンケートの基本" subtitle="何のためのアンケートですか？" />
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>タイトル</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              className={inputClass}
              placeholder="例: 部署の歓迎会、みんなの都合を教えて！"
            />
          </div>
          <div>
            <label className={labelClass}>説明(任意)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              className={`${inputClass} min-h-[80px] resize-none`}
              placeholder="参加者への一言メッセージなど"
            />
          </div>
          <div>
            <label className={labelClass}>イベント種類(任意)</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleEventTypeClick(opt.value)}
                  disabled={saving}
                  className={`rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-semibold border transition-colors disabled:opacity-50 ${
                    eventType === opt.value
                      ? "bg-gold-gradient border-transparent text-white"
                      : "border-gold/15 text-ink-secondary hover:border-gold/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <ChapterHeading number="第二章" title="何を聞く?" subtitle="参加者に確認したい項目を選んでください" />
        <div className="flex flex-col gap-2">
          {[
            { key: "dates", label: "日程", checked: askDates, set: setAskDates },
            { key: "budget", label: "予算", checked: askBudget, set: setAskBudget },
            { key: "genre", label: "ジャンル", checked: askGenre, set: setAskGenre },
            { key: "attend", label: "参加意思", checked: askAttend, set: setAskAttend },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-3 rounded-xl border border-gold/10 px-4 py-3 text-sm text-ink cursor-pointer"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.set(e.target.checked)}
                disabled={saving}
                className="h-5 w-5 accent-gold"
              />
              {item.label}
            </label>
          ))}
        </div>
      </div>

      {askDates && (
        <div>
          <ChapterHeading number="第三章" title="日程候補" subtitle="参加者に選んでもらう候補日を追加してください" />
          <DateOptionInput values={dateOptions} onChange={setDateOptions} disabled={saving} />
        </div>
      )}

      {askBudget && (
        <div>
          <ChapterHeading number="第四章" title="予算" subtitle="参加者が回答する範囲を設定してください(円)" />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-ink-muted mb-1">最小(円)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={budgetMinInput}
                onChange={(e) => setBudgetMinInput(sanitizeNumericInput(e.target.value))}
                disabled={saving}
                className={inputClass.replace("mt-1.5 ", "")}
              />
            </div>
            <div>
              <label className="block text-[11px] text-ink-muted mb-1">最大(円)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={budgetMaxInput}
                onChange={(e) => setBudgetMaxInput(sanitizeNumericInput(e.target.value))}
                disabled={saving}
                className={inputClass.replace("mt-1.5 ", "")}
              />
            </div>
            <div>
              <label className="block text-[11px] text-ink-muted mb-1">刻み(円)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={budgetStepInput}
                onChange={(e) => setBudgetStepInput(sanitizeNumericInput(e.target.value))}
                disabled={saving}
                className={inputClass.replace("mt-1.5 ", "")}
              />
            </div>
          </div>
          {budgetMin >= budgetMax && (
            <p className="text-xs text-vermilion-text mt-2">最大は最小より大きい値にしてください。</p>
          )}
        </div>
      )}

      {askGenre && (
        <div>
          <ChapterHeading number="第五章" title="ジャンル候補" subtitle="お店のジャンル候補を追加してください" />
          <OptionListInput values={genreOptions} onChange={setGenreOptions} placeholder="例: 居酒屋" disabled={saving} />
        </div>
      )}

      <div>
        <ChapterHeading number="第六章" title="締切(任意)" subtitle="回答の締切を設定できます" />
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={saving}
          className={inputClass.replace("mt-1.5 ", "")}
        />
      </div>

      <div>
        <ChapterHeading number="第七章" title="もっと聞きたいこと(任意)" subtitle="必要な項目だけ追加できます" />
        <OptionalQuestionsSection
          eventType={eventType}
          value={optionalQuestions}
          onChange={setOptionalQuestions}
          disabled={saving}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion-text">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3 text-sm hover:brightness-110 transition-all shadow-gold disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
        {saving ? "作成中..." : "アンケートを作成する"}
      </button>

      {presetDialogFor && (
        <ConfirmDialog
          title={`💡 ${PRESET_LABELS[presetDialogFor]}？`}
          message="予算・ジャンルの候補をテンプレートから自動入力します。あとから自由に編集・削除できます。"
          confirmLabel="はい、使う"
          cancelLabel="自分でカスタム"
          onConfirm={() => applyPreset(presetDialogFor)}
          onCancel={() => setPresetDialogFor(null)}
        />
      )}
    </form>

      <div className="hidden lg:block">
        <div className="sticky top-24">
          <p className="text-xs font-semibold text-ink-secondary mb-3">◇ プレビュー</p>
          <SurveyPreview
            title={title}
            description={description}
            askDates={askDates}
            askBudget={askBudget}
            askGenre={askGenre}
            askAttend={askAttend}
            dateOptions={dateOptions}
            budgetMin={budgetMin}
            budgetMax={budgetMax}
            budgetStep={budgetStep}
            genreOptions={genreOptions}
            optionalQuestions={optionalQuestions}
          />
        </div>
      </div>
    </div>
  );
}
