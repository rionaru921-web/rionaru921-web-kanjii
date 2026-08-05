"use client";

import { useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { OPTIONAL_QUESTION_PRESETS, getSuggestedOptionalQuestions } from "@/lib/surveys/presets";
import type { OptionalQuestion, SurveyEventType } from "@/lib/surveys/types";
import DateRangeExtendedConfig from "./question-config/DateRangeExtendedConfig";
import BudgetSliderConfig from "./question-config/BudgetSliderConfig";
import SortableOptionalQuestion from "./SortableOptionalQuestion";

// "多い/multi_select" と同じ理由で、専用の設定UIが要る新タイプ
// ('date_range_extended' / 'budget_slider') もこのシンプルなボタン型
// ビルダーの対象外(それぞれ Wave 25 で追加する専用セクションから作る)。
const CUSTOM_TYPE_LABELS: Record<"text" | "select" | "yes_no", string> = {
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
  const [customType, setCustomType] = useState<"text" | "select" | "yes_no">("text");
  const [customOptions, setCustomOptions] = useState("");
  const [showAllPresets, setShowAllPresets] = useState(false);

  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((q) => q.id === active.id);
    const newIndex = value.findIndex((q) => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  }

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

      {value.length > 0 && (
        <div>
          <p className="text-sm font-medium text-ink mb-2">追加された質問(ドラッグで順番を変更できます)</p>
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={value.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-1.5">
                {value.map((q) => (
                  <SortableOptionalQuestion
                    key={q.id}
                    question={q}
                    onRemove={() => removeQuestion(q.id)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
                className={`rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-semibold border transition-colors disabled:opacity-50 ${
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

      <DateRangeExtendedConfig onAdd={(question) => onChange([...value, question])} disabled={disabled} />
      <BudgetSliderConfig onAdd={(question) => onChange([...value, question])} disabled={disabled} />

      {value.length >= 3 && (
        <div className="flex items-start gap-2 text-xs text-ink-muted bg-gold/5 rounded-xl p-3">
          <AlertTriangle size={14} className="shrink-0 mt-0.5 text-gold" />
          追加質問が{value.length}個あります。多すぎると回答してもらいにくくなるため、本当に必要な質問だけに絞ることをおすすめします。
        </div>
      )}
    </div>
  );
}
