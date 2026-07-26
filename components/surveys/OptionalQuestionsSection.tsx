"use client";

import { useState } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import { OPTIONAL_QUESTION_PRESETS, getSuggestedOptionalQuestions } from "@/lib/surveys/presets";
import type { OptionalQuestion, OptionalQuestionType, SurveyEventType } from "@/lib/surveys/types";

const CUSTOM_TYPE_LABELS: Record<Exclude<OptionalQuestionType, "multi_select">, string> = {
  text: "自由記述",
  select: "選択式",
  yes_no: "はい/いいえ",
};

export default function OptionalQuestionsSection({
  eventType,
  value,
  onChange,
  disabled,
}: {
  eventType: SurveyEventType | null;
  value: OptionalQuestion[];
  onChange: (value: OptionalQuestion[]) => void;
  disabled?: boolean;
}) {
  const [customLabel, setCustomLabel] = useState("");
  const [customType, setCustomType] = useState<Exclude<OptionalQuestionType, "multi_select">>("text");
  const [customOptions, setCustomOptions] = useState("");
  const [showAllPresets, setShowAllPresets] = useState(false);

  const suggested = getSuggestedOptionalQuestions(eventType ?? "other");
  const suggestedIds = new Set(suggested.map((q) => q.id));
  const otherPresets = OPTIONAL_QUESTION_PRESETS.filter((q) => !suggestedIds.has(q.id));
  const enabledIds = new Set(value.map((q) => q.id));

  function toggle(preset: OptionalQuestion) {
    if (enabledIds.has(preset.id)) {
      onChange(value.filter((q) => q.id !== preset.id));
    } else {
      onChange([...value, preset]);
    }
  }

  function addCustomQuestion() {
    const label = customLabel.trim();
    if (!label) return;
    const id = `custom_${Date.now()}`;
    const options = customType === "select" ? customOptions.split(",").map((o) => o.trim()).filter(Boolean) : undefined;
    if (customType === "select" && (!options || options.length === 0)) return;
    onChange([...value, { id, label, type: customType, options }]);
    setCustomLabel("");
    setCustomOptions("");
  }

  function removeQuestion(id: string) {
    onChange(value.filter((q) => q.id !== id));
  }

  const customQuestions = value.filter((q) => !OPTIONAL_QUESTION_PRESETS.some((p) => p.id === q.id));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-ink mb-2">おすすめの質問</p>
        <div className="flex flex-col gap-1.5">
          {suggested.map((preset) => (
            <label
              key={preset.id}
              className="flex items-start gap-3 rounded-xl border border-gold/10 px-4 py-3 text-sm text-ink cursor-pointer"
            >
              <input
                type="checkbox"
                checked={enabledIds.has(preset.id)}
                onChange={() => toggle(preset)}
                disabled={disabled}
                className="mt-0.5 h-5 w-5 accent-gold shrink-0"
              />
              <span>
                {preset.label}
                {preset.description && <span className="block text-xs text-ink-muted mt-0.5">{preset.description}</span>}
              </span>
            </label>
          ))}
        </div>
      </div>

      {otherPresets.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowAllPresets((v) => !v)}
            disabled={disabled}
            className="text-xs text-gold underline"
          >
            {showAllPresets ? "他の質問を隠す" : "他の質問も見る"}
          </button>
          {showAllPresets && (
            <div className="mt-2 flex flex-col gap-1.5">
              {otherPresets.map((preset) => (
                <label
                  key={preset.id}
                  className="flex items-start gap-3 rounded-xl border border-gold/10 px-4 py-3 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={enabledIds.has(preset.id)}
                    onChange={() => toggle(preset)}
                    disabled={disabled}
                    className="mt-0.5 h-5 w-5 accent-gold shrink-0"
                  />
                  <span>{preset.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {customQuestions.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ink mb-2">追加したカスタム質問</p>
          <div className="flex flex-col gap-1.5">
            {customQuestions.map((q) => (
              <div key={q.id} className="flex items-center justify-between gap-2 rounded-xl border border-gold/10 px-4 py-3 text-sm">
                <span className="text-ink">{q.label}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  disabled={disabled}
                  className="shrink-0 text-ink-muted hover:text-vermilion-text"
                  aria-label="この質問を削除"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gold/10 p-4">
        <p className="text-sm font-medium text-ink mb-2">カスタム質問を追加</p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            disabled={disabled}
            maxLength={100}
            placeholder="質問文を入力(例: 苦手な食べ物は?)"
            className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
          />
          <div className="flex gap-1.5">
            {(Object.keys(CUSTOM_TYPE_LABELS) as Array<keyof typeof CUSTOM_TYPE_LABELS>).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCustomType(t)}
                disabled={disabled}
                className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                  customType === t ? "bg-gold-gradient border-transparent text-white" : "border-gold/15 text-ink-secondary hover:border-gold/30"
                }`}
              >
                {CUSTOM_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          {customType === "select" && (
            <input
              type="text"
              value={customOptions}
              onChange={(e) => setCustomOptions(e.target.value)}
              disabled={disabled}
              placeholder="選択肢をカンマ区切りで入力(例: A,B,C)"
              className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
            />
          )}
          <button
            type="button"
            onClick={addCustomQuestion}
            disabled={disabled || !customLabel.trim()}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-sm font-medium text-gold py-2 hover:bg-gold/5 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            質問を追加
          </button>
        </div>
      </div>

      {value.length >= 3 && (
        <div className="flex items-start gap-2 text-xs text-ink-muted bg-gold/5 rounded-xl p-3">
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-gold" />
          追加質問が{value.length}個あります。多すぎると回答してもらいにくくなるため、本当に必要な質問だけに絞ることをおすすめします。
        </div>
      )}
    </div>
  );
}
