"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export default function SortableMemberRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-2 rounded-xl border border-gold/10 p-3 ${
        isDragging ? "relative z-10 bg-surface-tertiary opacity-70 shadow-warm-hover" : ""
      }`}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label="ドラッグして並び替え"
          className="mt-2 flex shrink-0 items-center justify-center min-h-[44px] min-w-[28px] touch-none text-ink-muted/50 hover:text-ink-muted cursor-grab active:cursor-grabbing disabled:opacity-30"
        >
          <GripVertical size={16} />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
