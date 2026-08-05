"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import type { OptionalQuestion, OptionalQuestionType } from "@/lib/surveys/types";

const TYPE_LABELS: Record<OptionalQuestionType, string> = {
  text: "自由記述",
  select: "選択式",
  multi_select: "複数選択",
  yes_no: "はい/いいえ",
  date_range_extended: "日程調整(4段階)",
  budget_slider: "予算スライダー",
};

// 質問の順序を表す一覧行。並び替えは SortableMemberRow
// (components/manual-plans/SortableMemberRow.tsx) と同じ @dnd-kit パターン。
export default function SortableOptionalQuestion({
  question,
  onRemove,
  disabled,
}: {
  question: OptionalQuestion;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-xl border border-gold/10 px-3 py-2.5 bg-surface ${
        isDragging ? "relative z-10 bg-surface-tertiary opacity-70 shadow-warm-hover" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={disabled}
        aria-label="ドラッグして並び替え"
        className="flex shrink-0 items-center justify-center min-h-[36px] min-w-[28px] touch-none text-ink-muted/50 hover:text-ink-muted cursor-grab active:cursor-grabbing disabled:opacity-30"
      >
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink truncate">{question.label}</p>
        <p className="text-[11px] text-ink-muted">{TYPE_LABELS[question.type]}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`${question.label}を削除`}
        className="shrink-0 text-ink-muted hover:text-vermilion-text"
      >
        <X size={16} />
      </button>
    </div>
  );
}
